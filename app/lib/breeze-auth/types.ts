import { SessionStorage, TypedResponse } from "@remix-run/node";

export interface BreezeAuthUser {
  id: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  emailVerified: boolean;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  roles: string[];
}

export type BreezeAuthSessionUser = Omit<BreezeAuthUser, "password" | "createdAt" | "updatedAt">;

export type ExtendedBreezeAuthSessionUser<T = object> = BreezeAuthSessionUser & T;

export interface BreezeAuthSessionFlashData {
  error: {
    message: string;
    code: string;
  };
}

export interface CreateBreezeAuthOptions<T> {
  /**
   * The database adapter to use for BreezeAuth to interact with the database
   * @example
   * ```ts
   * import { PrismaAdapter } from "./breeze-auth/adapters/prisma-adapter";
   * import { prisma } from "prisma/client";
   *
   * const auth = createBreezeAuth({
   *   databaseAdapter: PrismaAdapter(prisma),
   *   // other options
   * });
   * ```
   */
  databaseAdapter: DatabaseAdapter<T>;
  /**
   * The cookie configuration for the session
   * @example
   * ```ts
   * const auth = createBreezeAuth({
   *   cookie: {
   *     name: "__breeze-auth-session__",
   *     secret: process.env.COOKIE_SECRET,
   *     maxAge: 30 * 24 * 60 * 60, // 30 days
   *   },
   *  // other options
   * });
   * ```
   */
  cookie: {
    name: string;
    secret: string;
    maxAge?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "lax" | "strict" | "none";
  };
}

export interface CreateBreezeAuthWithCustomSessionStorageOptions<T> {
  /**
   * The database adapter to use for BreezeAuth to interact with the database
   * @example
   * ```ts
   * import { PrismaAdapter } from "./breeze-auth/adapters/prisma-adapter";
   * import { prisma } from "prisma/client";
   *
   * const auth = createBreezeAuth({
   *   databaseAdapter: PrismaAdapter(prisma),
   *   // other options
   * });
   * ```
   */
  databaseAdapter: DatabaseAdapter<T>;
  /**
   * A custom session storage to use for BreezeAuth if you want to use a different session storage
   * other than the default cookie session storage.
   * @example
   * ```ts
   * import { createDatabaseSessionStorage } from "./breeze-auth/session-storage";
   *
   * const auth = createBreezeAuth({
   *   databaseAdapter: PrismaAdapter(prisma),
   *   sessionStorage: createDatabaseSessionStorage({
   *     cookie: {
   *       name: "__session",
   *       maxAge: 30 * 24 * 60 * 60,
   *       httpOnly: true,
   *       sameSite: "lax",
   *       secure: process.env.NODE_ENV === "production",
   *     },
   *   }),
   * });
   * ```
   */
  sessionStorage: SessionStorage<
    { user: ExtendedBreezeAuthSessionUser<T> },
    BreezeAuthSessionFlashData
  >;
}

export type RequireAuthOptions = {
  /**
   * The URL to redirect to if the user is not authenticated
   * Example: /auth/login
   */
  ifNotAuthenticatedRedirectTo: string;
  /**
   * The roles required to access the page
   * By default, any authenticated user can access the page
   */
  withRoles?: string[];
  /**
   * The URL to redirect to if the user is authenticated but not authorized to access the page
   * Example: /auth/unauthorized
   */
  ifNotAuthorizedRedirectTo?: string;
};

export interface RequireRoleOptions {
  /**
   * The URL to redirect to if the user does not have the required role to access the page
   * Default: /auth/unauthorized
   */
  redirectTo: string;
}

export interface BreezeAuthProvider {
  /**
   * The type of the authentication provider.
   * Example: "credentials"
   */
  type: "credentials";
  /**
   * The URL to your password reset page. This is used to redirect the user to the password reset page
   * when they click the reset password link in the password reset email.
   *
   * Example: /auth/reset-password
   */
  resetPasswordPageUrl?: string;
  /**
   * The URL to your email verification page. This is used to redirect the user to the email verification page
   * when they click the email verification link in the email verification email.
   *
   * Example: /auth/verify-email
   */
  emailVerificationPageUrl?: string;
  /**
   * A function that sends a password reset email to the user.
   * @param options - The options object containing the user's email and the password reset link.
   * @param options.user - The user object containing the user's id and email.
   * @param options.resetLink - The password reset link that the user can click to reset their password.
   * @returns An object containing an error flag and an optional message.
   */
  sendResetPasswordEmail?: (options: {
    user: { id: string; email: string; firstName?: string; lastName?: string };
    resetLink: string;
  }) => Promise<{
    error: {
      message: string;
      code: string;
      meta?: object;
    } | null;
  }>;

  /**
   * A function that sends an email verification email to the user.
   * @param options - The options object containing the user's email and the email verification link.
   * @param options.user - The user object containing the user's id and email.
   * @param options.verificationLink - The email verification link that the user can click to verify their email.
   * @returns An object containing an error flag and an optional message.
   */
  sendEmailVerificationEmail?: (options: {
    user: { id: string; email: string; firstName?: string; lastName?: string };
    verificationLink: string;
  }) => Promise<{
    error: {
      message: string;
      code: string;
      meta?: object;
    } | null;
  }>;
}

/*
 * Database Adapter
 */
export interface UserCredentials {
  email: string;
  password: string;
}

export interface ErrorObject {
  message: string;
  code: string;
  meta?: object;
}

export interface UserDataSuccess<T> {
  user: T;
  error: null;
}

export interface UserDataError {
  user: null;
  error: ErrorObject;
}

export interface TokenDataSuccess {
  error: null;
  token: string;
}

export interface TokenDataError {
  error: ErrorObject;
  token: null;
}

export interface TokenValidationSuccess {
  error: null;
  tokenData: {
    token: string;
    identifier: string;
    type: string;
    expires: Date | string;
  };
}

export interface TokenValidationError {
  error: ErrorObject;
  tokenData: null;
}

export interface DatabaseAdapter<T> {
  getUserByEmail: (email: string) => Promise<UserDataSuccess<T> | UserDataError>;
  loginUser: (credentials: UserCredentials) => Promise<UserDataSuccess<T> | UserDataError>;
  registerUser: (request: Request) => Promise<UserDataSuccess<T> | UserDataError>;
  verifyEmail: (token: string) => Promise<UserDataSuccess<T> | UserDataError>;
  /**
   * -----------------------------------------
   * generatePasswordResetToken
   * -----------------------------------------
   * Generate a password reset token for the user.
   * @param email - The user's email address
   * @param options - The options object
   * @param options.expiresAfterMinutes - After how many minutes the token should expire
   * @returns An object containing the token or an error object with a message and code if an error occurred
   */
  generatePasswordResetToken: (
    email: string,
    options: { expiresAfterMinutes: number }
  ) => Promise<TokenDataSuccess | TokenDataError>;
  generateEmailVerificationToken: (
    email: string,
    options: { expiresAfterMinutes: number }
  ) => Promise<TokenDataSuccess | TokenDataError>;
  deletePasswordResetToken: (token: string) => Promise<{ error: ErrorObject | null }>;
  validatePasswordResetToken: (
    token: string
  ) => Promise<TokenValidationSuccess | TokenValidationError>;
  resetUserPassword: (options: {
    token: string;
    newPassword: string;
  }) => Promise<UserDataError | UserDataSuccess<T>>;
  changeUserPassword: (options: {
    userId: string | number;
    currentPassword: string;
    newPassword: string;
  }) => Promise<UserDataError | UserDataSuccess<T>>;
}

export type BreezeAuthOptions<T> =
  | CreateBreezeAuthOptions<T>
  | CreateBreezeAuthWithCustomSessionStorageOptions<T>;

export type SessionStorageType<T> = SessionStorage<
  { user: ExtendedBreezeAuthSessionUser<T>; metadata: object },
  BreezeAuthSessionFlashData
>;

export type BreezeAuthSessionData<T> = {
  user: ExtendedBreezeAuthSessionUser<T>;
  metadata: object;
};

export interface IRemixBreezeAuth<T extends BreezeAuthSessionUser> {
  sessionStorage: SessionStorageType<T>;
  /**
   * -----------------------------------------
   * use
   * -----------------------------------------
   * Register an authentication provider for BreezeAuth to use
   * @param provider - The authentication provider to use
   * @example
   * ```ts
   * auth.use({
   *  type: "credentials",
   *  resetPasswordPageUrl: "/auth/reset-password",
   *  sendResetPasswordEmail: async ({ user, resetLink }) => {
   *   const { error } = await sendTransactionalEmail({
   *    to: user.email,
   *    subject: "Password Reset Link",
   *    html: `
   *     <h1>Your password reset link</h1>
   *     <p>Click the link below to reset your password</p>
   *     <a href="${process.env.APP_BASE_URL}${resetLink}">Reset Password</a>
   *    `,
   *   });
   *
   *  return {
   *   error: Boolean(error),
   *   message: "Error sending email. Please try again",
   *  };
   * });
   * ```
   */
  use(provider: BreezeAuthProvider): void;
  /**
   * -----------------------------------------
   * validateEmail
   * -----------------------------------------
   * Basic email validation. Checks if at least one character is before and after the "@" symbol
   * and if there is at least one character before and after the "." symbol.
   * @param email - The email address to validate
   * @returns A boolean indicating whether the email address is valid
   */
  validateEmail(email: string): boolean;
  logout(request: Request, options: { redirectTo: string }): Promise<Response>;
  /**
   * -----------------------------------------
   * getSession
   * -----------------------------------------
   * Parse the authentication session from the request cookie
   * @param request - The request object
   * @returns The session object
   */
  getSession(request: Request): Promise<ReturnType<typeof sessionStorage.getSession>>;
  /**
   * -----------------------------------------
   * registerUser
   * -----------------------------------------
   * Register a new user and returns an object with `user` and `error` properties.
   * If the registration is successful, the `user` property will contain the user data.
   * If the registration fails, the `error` property will contain the error message and code.
   * If the `authenticateAndRedirectTo` option is provided, the user will be authenticated and
   * redirected to the provided URL.
   * @param request - The request object
   * @param options - The options object
   * @param options.authenticateAndRedirectTo - [optional] The URL to redirect the user to after registration and authentication
   * @returns The user object if the registration is successful. Otherwise, an object with the error message and code.
   */
  registerUser(request: Request): Promise<UserDataSuccess<T> | UserDataError>;
  registerUser(
    request: Request,
    options?: { authenticateAndRedirectTo: string }
  ): Promise<UserDataSuccess<T> | UserDataError>;
  /**
   * -----------------------------------------
   * updateSession
   * -----------------------------------------
   * Update the session with the provided data and redirect the user to the provided URL.
   * If a redirect URL is provided, the session will be commited and user will be redirected to the URL.
   * If no redirect URL is provided, the session will be returned and it's up to the caller to commit the session.
   *
   * @param request - The request object
   * @param options - The options object
   * @param options.data - The session data to update
   * @param options.redirectTo - The URL to redirect the user to
   * @returns The HTTP response object if a redirect URL is provided, otherwise the session object
   *
   * @example
   * ```ts
   * await auth.updateSession(request, {
   *  data: {
   *     user: {
   *        id: 1,
   *        email: "user@email.com",
   *        roles: ["user"],
   *     }
   *  }
   *  redirectTo: "/account",
   * });
   */
  updateSession(
    request: Request,
    options: { data: { user: ExtendedBreezeAuthSessionUser<T> }; redirectTo?: string }
  ): Promise<Response | ReturnType<typeof sessionStorage.getSession>>;
  /**
   * -----------------------------------------
   * requireRole
   * -----------------------------------------
   * Require a specific role to access a page. If the user does not have the required role,
   * he will be redirected to the provided "redirectTo" option.
   * @param request - The request object
   * @param role - The role to require
   * @param options - The options object
   * @param options.redirectTo - The URL to redirect the user to if they do not have the required role
   * @returns The user object if the user has the required role. Otherwise, redirects the user to the provided URL.
   * @example
   * Require the "admin" role and redirect to the default "/auth/unauthorized" if the user does not have the role.
   * ```ts
   * await auth.requireRole(request, "admin", { redirectTo: "/auth/unauthorized" });
   * ```
   */
  requireRole(
    request: Request,
    role: string,
    options: RequireRoleOptions
  ): Promise<ExtendedBreezeAuthSessionUser<T>>;
  /**
   * -----------------------------------------
   * requireAuth
   * -----------------------------------------
   * Require authentication to access a page. If the user is not authenticated,
   * he will be redirected to the signin or the provided redirectTo option.
   * otherwise, the session will be returned.
   *
   * Optionally, you can require specific roles to access the page.
   * If the user does not have the required role, he will be redirected to the unauthorizedredirectTo option.
   *
   * @param request - The request object
   * @param options - The options object
   * @param options.ifNotAuthenticatedRedirectTo - [required] The URL to redirect the user to if they are not authenticated
   * @param options.roles - [optional] The roles required to access the page. By default any authenticated user can access any page.
   * @param options.ifNotAuthorizedRedirectTo - [optional] The URL to redirect the user to if they do not have the required role default to "/" if not provided
   * @returns The session if the user is authenticated. Otherwise, redirects the user to the provided URL.
   * @example
   *
   * Require authentication and redirect to the default "/auth/login" if the user is not authenticated.
   * ```ts
   * const session = await auth.requireAuth(request, { redirectTo: "/auth/login" });
   * const user = session.get("user");
   * ```
   *
   * Require authentication and the "admin" role, and redirect to "/auth/unauthorized" if the user does not have the required role.
   * ```ts
   * await auth.requireAuth(request, {
   *    roles: ["admin"]
   *    redirectTo: "/auth/login",
   *    unauthorizedredirectTo: "/auth/unauthorized",
   * });
   * ```
   */
  requireAuth(
    request: Request,
    options: RequireAuthOptions
  ): Promise<ReturnType<typeof sessionStorage.getSession>>;
  /**
   * -----------------------------------------
   * resetPassword
   * -----------------------------------------
   * Reset the user's password and redirect them to the reset password success page
   * @param request - The request object. Should contain the form data with the "token", "newPassword" and "confirmNewPassword" fields
   * @param options - The options object
   * @param options.onSuccessRedirectTo - The URL to redirect the user to after the password has been reset
   * @returns The HTTP response object with the redirect URL to the reset password success page
   * @example
   * ```ts
   * await auth.resetPassword(request, {
   *  onSuccessRedirectTo: "/auth/reset-password-success",
   * });
   * ```
   */
  resetPassword(
    request: Request,
    options: { onSuccessRedirectTo: string }
  ): Promise<
    | TypedResponse<never>
    | {
        data: { token: string; newPassword: string; confirmNewPassword: string } | null;
        error: { message: string; code: string } | null;
      }
  >;
  resetPassword(request: Request): Promise<
    | TypedResponse<never>
    | {
        data: { token: string; newPassword: string; confirmNewPassword: string } | null;
        error: { message: string; code: string } | null;
      }
  >;
  /**
   * -----------------------------------------
   * changePassword
   * -----------------------------------------
   * Change the user's password
   * @param userId - The user's ID
   * @param currentPassword - The user's current password
   * @param newPassword - The user's new password
   * @returns An object with the error message and code if an error occurs. Otherwise, the user's data will be returned.
   * @example
   * ```ts
   * const {user, error} = await auth.changePassword({
   *  userId: 1,
   *  currentPassword: "currentPassword",
   *  newPassword: "newPassword",
   * });
   * ```
   */
  changePassword(options: {
    userId: string | number;
    currentPassword: string;
    newPassword: string;
  }): Promise<UserDataSuccess<T> | UserDataError>;
  /**
   * -----------------------------------------
   * requireAllRoles
   * -----------------------------------------
   * Require all the specified roles to access a page. If the user does not have all the required roles,
   * he will be redirected to the provided "redirectTo" option.
   * @param request - The request object
   * @param roles - The roles to require
   * @param options - The options object
   * @param options.redirectTo - The URL to redirect the user to if they do not have the required roles
   * @returns The user object if the user has all the required roles. Otherwise, redirects the user to the provided URL.
   * @example
   * Require the "admin" and "editor" roles and redirect to "/auth/unauthorized" if the user does not have the roles.
   * ```ts
   * await auth.requireAllRoles(request, ["admin", "editor"], { redirectTo: "/auth/unauthorized" });
   * ```
   */
  requireAllRoles(
    request: Request,
    roles: string[],
    options: RequireRoleOptions
  ): Promise<ExtendedBreezeAuthSessionUser<T>>;
  /**
   * -----------------------------------------
   * requireSomeRoles
   * -----------------------------------------
   * Require at least one of the specified roles to access a page. If the user does not have any of the required roles,
   * he will be redirected to the provided "redirectTo" option.
   * @param request - The request object
   * @param roles - The roles to require
   * @param options - The options object
   * @param options.redirectTo - The URL to redirect the user to if they do not have the required roles
   * @returns The user object if the user has at least one of the required roles. Otherwise, redirects the user to the provided URL.
   * @example
   * Require the "admin" or "editor" roles and redirect to "/auth/unauthorized" if the user does not have any of the roles.
   * ```ts
   * await auth.requireSomeRoles(request, ["admin", "editor"], { redirectTo: "/auth/unauthorized" });
   * ```
   */
  requireSomeRoles(
    request: Request,
    roles: string[],
    options: RequireRoleOptions
  ): Promise<ExtendedBreezeAuthSessionUser<T>>;
  /**
   * -----------------------------------------
   * getUserFromSession
   * -----------------------------------------
   * Get the user from the session
   * @param request - The request object
   */
  getUserFromSession(request: Request): Promise<ExtendedBreezeAuthSessionUser<T> | null>;

  /**
   * -----------------------------------------
   * sendPasswordResetLink
   * -----------------------------------------
   * Send a password reset link to the user's email. The user will be redirected to the provided "onSuccessRedirectTo" URL
   * after the password reset link has been sent. If an error occurs, an error object will be returned with the error message and code.
   * @param request - The request object. Should contain the "email" address in the request's form data.
   * @param options - The options object
   * @param options.expireLinkAfterMinutes - The number of minutes after which the password reset link will expire
   * @param options.onSuccessRedirectTo - The URL to redirect the user to after the password reset link has been sent. The email address will be appended to the URL as a query parameter.
   * @returns - An object with the error message and code if an error occurs. Otherwise, the user will be redirected to the provided URL.
   *
   * Make sure to configure the "sendResetPasswordEmail" && "resetPasswordPageUrl" in the credentials provider configuration
   * to be able to use the sendPasswordResetLink function.
   *
   * @example
   * In your credentials provider configuration:
   * ```ts
   * auth.use({
   * type: "credentials",
   * resetPasswordPageUrl: "/auth/reset-password",
   * sendResetPasswordEmail: async ({ user, resetLink }) => {
   *  const { error } = await sendTransactionalEmail({
   *   to: user.email,
   *  subject: "Password Reset Link",
   * html: `
   * <h1>Your password reset link</h1>
   * <p>Click the link below to reset your password</p>
   * <a href="${resetLink}">Reset Password</a>
   * `,
   * });
   *
   * if (error) {
   *   return {
   *     error: {
   *       message: "Error sending email. Please try again",
   *       code: "send_password_reset_email_error",
   *     }
   *  };
   *
   *  return { error: null };
   * });
   * ```
   *
   * Then in your route you can use the sendPasswordResetLink function like this:
   *
   * ```ts
   * import auth from "~/auth.server";
   *
   * export const action = async ({ request }) => {
   *   return auth.sendPasswordResetLink(request, {
   *     onSuccessRedirectTo: "/auth/reset-password-email-sent",
   *     expireLinkAfterMinutes: 15,
   *   });
   * };
   */
  sendPasswordResetLink(
    request: Request,
    options: { expireLinkAfterMinutes: number; onSuccessRedirectTo?: string }
  ): Promise<TypedResponse<never> | { error: { message: string; code: string } | null }>;

  /**
   * -----------------------------------------
   * sendEmailVerificationLink
   * -----------------------------------------
   * Send an email verification link to the user's email. The user will be redirected to the provided "onSuccessRedirectTo" URL
   * after the email verification link has been sent. If an error occurs, an error object will be returned with the error message and code.
   * @param request - The request object. Should contain the "email" address in the request's form data.
   * @param options - The options object
   * @param options.expireLinkAfterMinutes - The number of minutes after which the email verification link will expire
   * @returns - An object with the error message and code if an error occurs. Otherwise, the user will be redirected to the provided URL.
   *
   * Make sure to configure the "sendEmailVerificationEmail" && "emailVerificationPageUrl" in the credentials provider configuration
   * to be able to use the sendEmailVerificationLink function.
   *
   * @example
   * In your credentials provider configuration:
   * ```ts
   * auth.use({
   * type: "credentials",
   * emailVerificationPageUrl: "/auth/verify-email",
   * sendEmailVerificationEmail: async ({ user, verificationLink }) => {
   *  const { error } = await sendTransactionalEmail({
   *   to: user.email,
   *  subject: "Email Verification Link",
   * html: `
   * <h1>Your email verification link</h1>
   * <p>Click the link below to verify your email</p>
   * <a href="${verificationLink}">Verify Email</a>
   * `,
   * });
   *
   * if (error) {
   *   return {
   *     error: {
   *       message: "Error sending email. Please try again",
   *       code: "send_email_verification_email_error",
   *     }
   *  };
   *
   *  return { error: null };
   * });
   * ```
   *
   * Then in your route you can use the sendEmailVerificationLink function like this:
   *
   * ```ts
   * import auth from "@/auth.server";
   *
   * export const action = async ({ request }) => {
   *   return auth.sendEmailVerificationLink(request, {
   *     expireLinkAfterMinutes: 15,
   *   });
   * };
   * ```
   * @example
   * ```ts
   * await auth.sendEmailVerificationLink(request, {
   *  expireLinkAfterMinutes: 15,
   * });
   * ```
   * @example
   * ```ts
   * const result = await auth.sendEmailVerificationLink("user@email.com", {
   *  expireLinkAfterMinutes: 15,
   * });
   * ```
   * */
  sendEmailVerificationLink(
    request: Request,
    options: { expireLinkAfterMinutes: number }
  ): Promise<{ error: { message: string; code: string } | null }>;
  sendEmailVerificationLink(
    email: string,
    options: { expireLinkAfterMinutes: number }
  ): Promise<{ error: { message: string; code: string } | null }>;

  /**
   * -----------------------------------------
   * verifyEmail
   * -----------------------------------------
   * Verify the user's email address using the provided token
   * @param token - The email verification token
   * @returns An object with the error message and code if an error occurs. Otherwise, the user's data will be returned.
   * @example
   * ```ts
   * const result = await auth.verifyEmail("email-verification-token");
   * ```
   */
  verifyEmail(token: string): Promise<UserDataSuccess<T> | UserDataError>;
  /**
   * -----------------------------------------
   * redirectIfAuthenticated
   * -----------------------------------------
   * Redirects the user to the provided URL if they are authenticated.
   * Otherwise, returns the session.
   * @param request - The request object
   * @param options - The options object
   * @param options.to - The URL to redirect the user to if they are authenticated
   * @returns The session object if the user is not authenticated. Otherwise, redirects the user to the provided URL.
   * @example
   * ```ts
   * await auth.redirectIfAuthenticated(request, {
   *   to: "/dashboard",
   * });
   * ```
   */
  redirectIfAuthenticated(
    request: Request,
    options: { to: string }
  ): Promise<ReturnType<typeof sessionStorage.getSession>>;
  /**
   * -----------------------------------------
   * generatePasswordResetToken
   * -----------------------------------------
   * Generate a password reset token for the user
   * @param email - The user's email address
   * @param options - The options object
   * @param options.expiresAfterMinutes - After how many minutes the token should expire
   * @returns An object containing the token or an error object with a message and code if an error occurred
   * @example
   * ```ts
   * const generateTokenResult = await dbAdapter.generatePasswordResetToken("email@example.com",{
   *   expiresAfterMinutes: 15,
   * });
   * ```
   */
  generatePasswordResetToken(
    email: string,
    options: { expiresAfterMinutes: number }
  ): Promise<TokenDataSuccess | TokenDataError>;
  /**
   * -----------------------------------------
   * validatePasswordResetToken
   * -----------------------------------------
   * Validate a password reset token
   * @param token - The password reset token
   * @returns An object with tokenData and error properties. If an error occurs,
   * the error property will contain the error message and code.
   */
  validatePasswordResetToken(token: string): Promise<TokenValidationSuccess | TokenValidationError>;
  /**
   * -----------------------------------------
   * getCommittedSessionHeaders
   * -----------------------------------------
   * This function commits the session and returns the Set-Cookie header
   * to be used in the HTTP response.
   */
  getCommittedSessionHeaders(
    session: ReturnType<typeof sessionStorage.getSession>
  ): Promise<{ "Set-Cookie": string }>;
  /**
   * -----------------------------------------
   * authenticateWithCredentials
   * -----------------------------------------
   * Authenticate a user with their email and password and redirect them to the provided redirectTo URL.
   * If the authentication fails, an error object will be returned with the error message and code.
   * @param request - The request object.
   * @param options - The options object
   * @param options.redirectTo - The URL to redirect the user to after authentication
   * @param options.email - The user's email address. Will attempt to get the email from the request formData if not provided.
   * @param options.password - The user's password. Will attempt to get the password from the request formData if not provided.
   */
  authenticateWithCredentials(
    request: Request,
    options: {
      email?: string;
      password?: string;
      redirectTo: string;
    }
  ): Promise<Response>;
}
