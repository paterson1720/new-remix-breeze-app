import { TypedResponse, createCookieSessionStorage, json, redirect } from "@remix-run/node";
import {
  BreezeAuthSessionUser,
  BreezeAuthProvider,
  BreezeAuthSessionFlashData,
  ExtendedBreezeAuthSessionUser,
  RequireAuthOptions,
  RequireRoleOptions,
  UserDataError,
  UserDataSuccess,
  DatabaseAdapter,
  IRemixBreezeAuth,
  SessionStorageType,
  BreezeAuthOptions,
  BreezeAuthSessionData,
} from "./types";

export class BreezeAuth<T extends BreezeAuthSessionUser> implements IRemixBreezeAuth<T> {
  private dbAdapter: DatabaseAdapter<T>;
  private providers: BreezeAuthProvider[] = [];
  sessionStorage: SessionStorageType<T>;

  constructor(breezeAuthOptions: BreezeAuthOptions<T>) {
    this.dbAdapter = breezeAuthOptions.databaseAdapter;
    if ("sessionStorage" in breezeAuthOptions) {
      this.sessionStorage = breezeAuthOptions.sessionStorage;
    } else {
      const cookieSecret = breezeAuthOptions.cookie.secret;

      if (!cookieSecret) throw new Error("BreezeAuth: cookieSecret is required");

      const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
      const defaultCookieMaxAge = breezeAuthOptions.cookie.maxAge || thirtyDaysInSeconds;

      this.sessionStorage = createCookieSessionStorage<
        BreezeAuthSessionData<T>,
        BreezeAuthSessionFlashData
      >({
        cookie: {
          name: "__breeze-auth-session__",
          secrets: [cookieSecret],
          maxAge: breezeAuthOptions.cookie.maxAge || defaultCookieMaxAge,
          httpOnly: breezeAuthOptions.cookie.httpOnly || true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        },
      });
    }
  }

  validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  use(provider: BreezeAuthProvider) {
    this.providers.push(provider);
  }

  getProviders() {
    return this.providers;
  }

  async logout(request: Request, options: { redirectTo: string }) {
    const session = await this.getSession(request);
    return redirect(options.redirectTo, {
      headers: {
        "Set-Cookie": await this.sessionStorage.destroySession(session),
      },
    });
  }

  async getSession(request: Request) {
    const cookieHeader = request.headers.get("Cookie");
    return this.sessionStorage.getSession(cookieHeader);
  }

  async registerUser(
    request: Request,
    options: { authenticateAndRedirectTo: string }
  ): Promise<TypedResponse<never>>;
  async registerUser(request: Request): Promise<UserDataSuccess<T> | UserDataError>;
  async registerUser(
    originalRequest: Request,
    options: { authenticateAndRedirectTo?: string } = {}
  ) {
    const providerConfig = this.providers.find((provider) => provider.type === "credentials");

    if (!providerConfig) {
      throw new Error(`BreezeAuth: No credentials provider found in the configuration`);
    }

    const request = originalRequest.clone();
    const registration = await this.dbAdapter.registerUser(request);

    if (!options.authenticateAndRedirectTo) return registration;

    if (registration.error) {
      return {
        user: null,
        error: {
          message: registration.error.message,
          code: registration.error.code,
        },
      };
    }

    try {
      const session = await this.getSession(request);
      session.set("user", registration.user);
      session.set("metadata", { userAgent: String(request.headers.get("User-Agent")) });

      return redirect(options.authenticateAndRedirectTo, {
        headers: await this.getCommittedSessionHeaders(session),
      });
    } catch (error) {
      const session = await this.getSession(request);
      throw redirect("/", {
        headers: {
          "Set-Cookie": await this.sessionStorage.destroySession(session),
        },
      });
    }
  }

  async updateSession(
    request: Request,
    options: {
      data: { user: ExtendedBreezeAuthSessionUser<T> };
      redirectTo?: string;
    }
  ) {
    const session = await this.getSession(request);

    if (!session.get("user")) {
      throw new Error("BreezeAuth: User is not authenticated. Cannot update session.");
    }

    session.set("user", options.data.user);
    this.sessionStorage.commitSession(session);

    if (options.redirectTo) {
      return redirect(options.redirectTo, {
        headers: await this.getCommittedSessionHeaders(session),
      });
    }

    return session;
  }

  async requireRole(request: Request, role: string, options: RequireRoleOptions) {
    const sessionUser = await this.getUserFromSession(request);
    if (!sessionUser || !sessionUser.roles.includes(role)) {
      throw redirect(options.redirectTo!);
    }
    return sessionUser;
  }

  async requireAuth(request: Request, options: RequireAuthOptions) {
    const session = await this.getSession(request);
    const sessionUser = session.get("user");

    if (!sessionUser) {
      throw redirect(options.ifNotAuthenticatedRedirectTo, {
        headers: {
          "Set-Cookie": await this.sessionStorage.destroySession(session),
        },
      });
    }

    if (options.withRoles?.length) {
      for (const role of options.withRoles) {
        await this.requireRole(request, role, {
          redirectTo: options.ifNotAuthorizedRedirectTo || "/",
        });
      }
    }

    return session;
  }

  async resetPassword(originalRequest: Request, options: { onSuccessRedirectTo?: string } = {}) {
    const providerConfig = this.providers.find((provider) => provider.type === "credentials");

    if (!providerConfig) {
      throw new Error(`BreezeAuth: No credentials provider found in the configuration`);
    }

    const request = originalRequest.clone();
    const formData = await request.formData();
    const formEntries = Object.fromEntries(formData.entries());

    const data = {
      token: String(formEntries.token || ""),
      newPassword: String(formEntries.newPassword || ""),
      confirmNewPassword: String(formEntries.confirmPassword || ""),
    };

    for (const [key, value] of Object.entries(data)) {
      if (!value.trim()) {
        return {
          data,
          error: {
            message: `${key} is required`,
            code: `${key}_required`,
          },
        };
      }
    }

    const tokenValidation = await this.validatePasswordResetToken(data.token);
    if (tokenValidation.error) {
      return {
        data,
        error: {
          message: tokenValidation.error.message,
          code: tokenValidation.error.code,
        },
      };
    }

    if (!data.newPassword?.trim()) {
      return {
        data: null,
        error: {
          message: "New Password is required",
          code: "password_required",
        },
      };
    }

    if (data.newPassword !== data.confirmNewPassword) {
      return {
        data,
        error: {
          message: "Passwords do not match",
          code: "passwords_do_not_match",
        },
      };
    }

    const resetPasswordResult = await this.dbAdapter.resetUserPassword({
      token: data.token,
      newPassword: data.newPassword,
    });

    if (resetPasswordResult.error) {
      return {
        data,
        error: {
          message: resetPasswordResult.error.message,
          code: resetPasswordResult.error.code,
        },
      };
    }

    await this.dbAdapter.deletePasswordResetToken(data.token);

    if (!options.onSuccessRedirectTo) {
      return { data, error: null };
    }

    const requestUrl = new URL(request.url);
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
    const redirectTo = new URL(options.onSuccessRedirectTo, baseUrl);
    redirectTo.searchParams.set("email", encodeURIComponent(resetPasswordResult.user.email));
    return redirect(redirectTo.toString());
  }

  async changePassword({
    userId,
    currentPassword,
    newPassword,
  }: {
    userId: string | number;
    currentPassword: string;
    newPassword: string;
  }) {
    const providerConfig = this.providers.find((provider) => provider.type === "credentials");

    if (!providerConfig) {
      throw new Error(`BreezeAuth: No credentials provider found in the configuration`);
    }

    return this.dbAdapter.changeUserPassword({ userId, currentPassword, newPassword });
  }

  async requireAllRoles(request: Request, roles: string[], options: RequireRoleOptions) {
    const sessionUser = await this.getUserFromSession(request);

    if (!sessionUser || !roles.every((role) => sessionUser.roles.includes(role))) {
      throw redirect(options.redirectTo!);
    }

    return sessionUser;
  }

  async requireSomeRoles(request: Request, roles: string[], options: RequireRoleOptions) {
    const sessionUser = await this.getUserFromSession(request);

    if (!sessionUser || !roles.some((role) => sessionUser.roles.includes(role))) {
      throw redirect(options.redirectTo!);
    }

    return sessionUser;
  }

  async getUserFromSession(originalRequest: Request) {
    const request = originalRequest.clone();
    const session = await this.getSession(request);
    return session.get("user") || null;
  }

  async sendPasswordResetLink(
    originalRequest: Request,
    options: { expireLinkAfterMinutes: number; onSuccessRedirectTo?: string }
  ) {
    const providerConfig = this.providers.find((provider) => provider.type === "credentials");

    if (!providerConfig) {
      throw new Error(`BreezeAuth: No credentials provider found in the configuration`);
    }

    const request = originalRequest.clone();
    const formData = await request.formData();
    const formEntries = Object.fromEntries(formData.entries());
    const email = formEntries.email as string;

    const isValidEmail = this.validateEmail(email);

    if (!email.trim()) {
      return {
        error: {
          message: "Email is required",
          code: "email_required",
        },
      };
    }

    if (!isValidEmail) {
      return {
        error: {
          message: "Invalid email address",
          code: "invalid_email",
        },
      };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const getUserResult = await this.dbAdapter.getUserByEmail(normalizedEmail);

    if (getUserResult.error) {
      return {
        error: {
          message: "User not found",
          code: "user_not_found",
        },
      };
    }

    const user = getUserResult.user;

    const { sendResetPasswordEmail, resetPasswordPageUrl } = providerConfig;
    if (!resetPasswordPageUrl || !sendResetPasswordEmail) {
      throw new Error(
        `BreezeAuth: "resetPasswordPageUrl" and "sendResetPasswordEmail" are required in the credentials provider configuration to be able to use the sendPasswordResetLink function.`
      );
    }

    const generateTokenResult = await this.dbAdapter.generatePasswordResetToken(user.email, {
      expiresAfterMinutes: options?.expireLinkAfterMinutes,
    });

    if (generateTokenResult.error) {
      return {
        error: {
          message: generateTokenResult.error.message,
          code: generateTokenResult.error.code,
        },
      };
    }

    const resetToken = generateTokenResult.token;
    const uriEncodedEmail = encodeURIComponent(email);
    const resetLink = `${resetPasswordPageUrl}?token=${resetToken}&email=${uriEncodedEmail}`;

    const sendMailResult = await sendResetPasswordEmail({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      resetLink,
    });

    if (sendMailResult.error) {
      return {
        error: {
          message: sendMailResult.error.message,
          code: sendMailResult.error.code,
        },
      };
    }

    if (!options.onSuccessRedirectTo) {
      return { error: null };
    }

    const searchParams = new URLSearchParams();
    searchParams.set("email", encodeURIComponent(email));
    const redirectUrl = `${options.onSuccessRedirectTo}?${searchParams.toString()}`;
    return redirect(redirectUrl);
  }

  async sendEmailVerificationLink(
    param: Request | string,
    options: { expireLinkAfterMinutes: number }
  ) {
    const providerConfig = this.providers.find((provider) => provider.type === "credentials");

    if (!providerConfig) {
      throw new Error(`BreezeAuth: No credentials provider found in the configuration`);
    }

    let userEmail: string;
    let user: ExtendedBreezeAuthSessionUser<T>;

    if (param instanceof Request) {
      const session = await this.getSession(param);
      const sessionUser = session.get("user");

      if (!sessionUser) {
        throw new Error(
          "BreezeAuth: User is not authenticated. Cannot send email verification link."
        );
      }
      userEmail = sessionUser.email;
      user = sessionUser;
    } else {
      userEmail = param;
      const getUserResult = await this.dbAdapter.getUserByEmail(userEmail);
      if (getUserResult.error) {
        return {
          error: {
            message: getUserResult.error.message,
            code: getUserResult.error.code,
          },
        };
      }

      user = getUserResult.user;
    }

    const { sendEmailVerificationEmail, emailVerificationPageUrl } = providerConfig;
    if (!emailVerificationPageUrl || !sendEmailVerificationEmail) {
      throw new Error(
        `BreezeAuth: "emailVerificationPageUrl" and "sendEmailVerificationEmail" are required in the credentials provider configuration to be able to use the sendEmailVerificationLink function.`
      );
    }

    const generateTokenResult = await this.dbAdapter.generateEmailVerificationToken(userEmail, {
      expiresAfterMinutes: options.expireLinkAfterMinutes,
    });

    if (generateTokenResult.error) {
      return {
        error: {
          message: generateTokenResult.error.message,
          code: generateTokenResult.error.code,
        },
      };
    }

    const verificationToken = generateTokenResult.token;
    const uriEncodedEmail = encodeURIComponent(userEmail);
    const verificationLink = `${emailVerificationPageUrl}?token=${verificationToken}&email=${uriEncodedEmail}`;

    const sendMailResult = await sendEmailVerificationEmail({
      verificationLink,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });

    if (sendMailResult.error) {
      return {
        error: {
          message: sendMailResult.error.message,
          code: sendMailResult.error.code,
        },
      };
    }

    return { error: null };
  }

  async verifyEmail(token: string) {
    const providerConfig = this.providers.find((provider) => provider.type === "credentials");
    if (!providerConfig) {
      throw new Error(`BreezeAuth: No credentials provider found in the configuration`);
    }

    return this.dbAdapter.verifyEmail(token);
  }

  async redirectIfAuthenticated(request: Request, options: { to: string }) {
    const session = await this.getSession(request);
    const isAuthenticated = session.get("user");
    if (isAuthenticated) throw redirect(options.to);
    return session;
  }

  async generatePasswordResetToken(email: string, options: { expiresAfterMinutes: number }) {
    const providerConfig = this.providers.find((provider) => provider.type === "credentials");

    if (!providerConfig) {
      throw new Error(`BreezeAuth: No credentials provider found in the configuration`);
    }

    const user = await this.dbAdapter.getUserByEmail(email);
    if (user.error) {
      return {
        token: null,
        error: {
          message: user.error.message,
          code: user.error.code,
        },
      };
    }

    const generateTokenResult = await this.dbAdapter.generatePasswordResetToken(email, {
      expiresAfterMinutes: options.expiresAfterMinutes,
    });

    return generateTokenResult;
  }

  async validatePasswordResetToken(token: string) {
    const providerConfig = this.providers.find((provider) => provider.type === "credentials");
    if (!providerConfig) {
      throw new Error(`BreezeAuth: No credentials provider found in the configuration`);
    }
    return this.dbAdapter.validatePasswordResetToken(token);
  }

  async getCommittedSessionHeaders(session: Awaited<ReturnType<typeof this.getSession>>) {
    return {
      "Set-Cookie": await this.sessionStorage.commitSession(session),
    };
  }

  async authenticateWithCredentials(
    originalRequest: Request,
    options: { redirectTo: string; email?: string; password?: string }
  ) {
    const providerConfig = this.providers.find((provider) => provider.type === "credentials");

    if (!providerConfig) {
      throw new Error(`BreezeAuth: No credentials provider found in the configuration`);
    }

    const credentials = {
      email: options.email as string,
      password: options.password as string,
    };

    const request = originalRequest.clone();
    if (!credentials.email || !credentials.password) {
      const formData = await request.formData();
      const formEntries = Object.fromEntries(formData.entries());
      credentials.email = credentials.email || (formEntries.email as string);
      credentials.password = credentials.password || (formEntries.password as string);
    }

    if (!this.validateEmail(credentials.email)) {
      return json({
        error: {
          message: "Invalid email address",
          code: "invalid_email",
        },
      });
    }

    for (const [key, value] of Object.entries(credentials)) {
      if (!value.trim()) {
        return json({
          error: {
            message: `${key} is required`,
            code: `${key}_required`,
          },
        });
      }
    }

    const { user, error } = await this.dbAdapter.loginUser(credentials);

    if (error) {
      return json({
        error: {
          message: error.message,
          code: error.code,
        },
      });
    }

    try {
      const session = await this.getSession(request);

      session.set("user", user);
      session.set("metadata", { userAgent: String(request.headers.get("User-Agent")) });

      return redirect(options.redirectTo, {
        headers: await this.getCommittedSessionHeaders(session),
      });
    } catch (error) {
      const session = await this.getSession(request);
      return redirect("/", {
        headers: {
          "Set-Cookie": await this.sessionStorage.destroySession(session),
        },
      });
    }
  }
}
