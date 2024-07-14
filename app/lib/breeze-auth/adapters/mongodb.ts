import crypto from "crypto";
import bcrypt from "bcryptjs";
import { MongoClient, ObjectId } from "mongodb";
import { BreezeAuthSessionUser, BreezeAuthUser, DatabaseAdapter } from "../types";

type User = Omit<BreezeAuthUser, "id" | "roles">;

export function MongoDBAdapter(
  getClient: () => Promise<MongoClient>
): DatabaseAdapter<BreezeAuthSessionUser> {
  async function db() {
    const client = await getClient();
    const db = client.db();
    return {
      User: db.collection<User>("User"),
      Verification: db.collection("VerificationRequest"),
      Role: db.collection("Role"),
      UserRole: db.collection("UserRole"),
    };
  }

  async function hashUserPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  async function comparePasswordToHashedPassword(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
  }

  function validateEmail(email: string) {
    // simple email validation - must contain @ and a dot
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePassword(password: string) {
    // must contain letters and numbers and be at least 6 characters long, but not limited to only numbers and letters
    // Example Password@123 or 123Password.com are valid but 123456 is not, can contain any special character
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\S]{6,}$/.test(password);
  }

  async function getUserRoles(userId: string) {
    const objectId = new ObjectId(userId);
    const { UserRole, Role } = await db();
    const userRoles = await UserRole.find({ userId: objectId }).toArray();
    const roles = await Role.find({
      _id: { $in: userRoles.map((userRole) => userRole.roleId) },
    }).toArray();
    return roles.map((role) => role.name);
  }

  async function registerUser(request: Request) {
    const formData = await request.formData();
    const formEntries = Object.fromEntries(formData.entries());

    const userData = {
      firstName: formEntries.firstName as string,
      lastName: formEntries.lastName as string,
      email: formEntries.email as string,
      password: formEntries.password as string,
    };

    for (const [key, value] of Object.entries(userData)) {
      if (!value.trim()) {
        return {
          user: null,
          error: {
            message: `${key} is required`,
            code: `${key}_required`,
          },
        };
      }
    }

    const isValidEmail = validateEmail(userData.email);
    if (!isValidEmail) {
      return {
        user: null,
        error: {
          message: "Invalid email address",
          code: "invalid_email",
        },
      };
    }

    const isValidPassword = validatePassword(userData.password);
    if (!isValidPassword) {
      return {
        user: null,
        error: {
          message: "Password must contain at least one letter and one number",
          code: "invalid_password_format",
        },
      };
    }

    const { User, Role, UserRole } = await db();
    const normalizedEmail = userData.email.trim().toLowerCase();
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return {
        user: null,
        error: {
          message: "A user with this email already exists",
          code: "user_already_exists",
        },
      };
    }

    const userRole = await Role.findOne({ name: "user" });

    if (!userRole) {
      return {
        user: null,
        error: {
          message: "Role 'user' not found in the Role collection",
          code: "role_not_found",
        },
      };
    }

    const hashedPassword = await hashUserPassword(userData.password);
    const user = await User.insertOne({
      email: normalizedEmail,
      password: hashedPassword,
      fullName: `${userData.firstName} ${userData.lastName}`,
      firstName: userData.firstName,
      lastName: userData.lastName,
      createdAt: new Date(),
      updatedAt: new Date(),
      avatar: "",
      emailVerified: false,
    });

    await UserRole.insertOne({
      userId: user.insertedId,
      roleId: userRole._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      error: null,
      user: {
        id: user.insertedId.toHexString(),
        email: userData.email,
        fullName: `${userData.firstName} ${userData.lastName}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        emailVerified: false,
        avatar: null,
        roles: ["user"],
      },
    };
  }

  async function loginUser(credentials: { email: string; password: string }) {
    const { User } = await db();

    const user = await User.findOne({ email: credentials.email });
    if (!user) {
      return {
        user: null,
        error: {
          message: "Invalid credentials",
          code: "invalid_credentials",
        },
      };
    }

    const hashedPassword = user.password;
    const isValidPassword = await comparePasswordToHashedPassword(
      credentials.password,
      hashedPassword
    );

    if (!isValidPassword) {
      return {
        user: null,
        error: {
          message: "Invalid credentials",
          code: "invalid_credentials",
        },
      };
    }

    return {
      error: null,
      user: {
        id: user._id.toHexString(),
        avatar: user.avatar,
        email: user.email,
        fullName: user.fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
        roles: await getUserRoles(user._id.toHexString()),
      },
    };
  }

  async function getUserByEmail(email: string) {
    const { User } = await db();
    const user = await User.findOne({ email });
    if (!user) {
      return {
        user: null,
        error: {
          message: "User not found",
          code: "user_not_found",
        },
      };
    }

    return {
      error: null,
      user: {
        id: user._id.toHexString(),
        avatar: user.avatar,
        email: user.email,
        fullName: user.fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
        roles: await getUserRoles(user._id.toHexString()),
      },
    };
  }

  async function generatePasswordResetToken(
    email: string,
    options: { expiresAfterMinutes: number }
  ) {
    const token = crypto.randomBytes(32).toString("hex");

    const { Verification } = await db();

    const existingRequest = await Verification.findOne({
      identifier: email,
      type: "password_reset",
    });

    if (existingRequest) {
      await Verification.deleteOne({ _id: existingRequest._id });
    }

    await Verification.insertOne({
      token,
      identifier: email,
      type: "password_reset",
      expires: new Date(Date.now() + options.expiresAfterMinutes * 60 * 1000),
    });

    return { error: null, token };
  }

  async function generateEmailVerificationToken(
    email: string,
    options: { expiresAfterMinutes: number }
  ) {
    const token = crypto.randomBytes(32).toString("hex");

    const { Verification } = await db();

    const existingRequest = await Verification.findOne({
      identifier: email,
      type: "email_verification",
    });

    if (existingRequest) {
      await Verification.deleteOne({ _id: existingRequest._id });
    }

    await Verification.insertOne({
      token,
      identifier: email,
      type: "email_verification",
      expires: new Date(Date.now() + options.expiresAfterMinutes * 60 * 1000),
    });

    return { error: null, token };
  }

  async function validatePasswordResetToken(token: string) {
    const { Verification } = await db();
    const verificationRequest = await Verification.findOne({
      token,
      type: "password_reset",
    });

    if (!verificationRequest) {
      return {
        tokenData: null,
        error: {
          message: "Invalid or expired token",
          code: "invalid_token",
        },
      };
    }

    const isExpired = verificationRequest.expires < new Date();
    if (isExpired) {
      await Verification.deleteOne({ _id: verificationRequest._id });
      return {
        tokenData: null,
        error: {
          message: "Invalid or expired token",
          code: "token_expired",
        },
      };
    }

    return {
      error: null,
      tokenData: {
        token: verificationRequest.token,
        identifier: verificationRequest.identifier,
        type: verificationRequest.type,
        expires: verificationRequest.expires,
      },
    };
  }

  async function resetUserPassword({ token, newPassword }: { token: string; newPassword: string }) {
    const hashedPassword = await hashUserPassword(newPassword);
    const { User } = await db();

    const validation = await validatePasswordResetToken(token);

    if (validation.error) {
      return {
        user: null,
        error: validation.error,
      };
    }

    const verificationRequest = validation.tokenData;

    const user = await User.findOneAndUpdate(
      { email: verificationRequest.identifier },
      { $set: { password: hashedPassword } },
      { returnDocument: "after" }
    );

    if (!user) {
      return {
        user: null,
        error: {
          message: "User not found",
          code: "user_not_found",
        },
      };
    }

    return {
      error: null,
      user: {
        id: user._id.toHexString(),
        avatar: user.avatar,
        email: user.email,
        fullName: user.fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
        roles: await getUserRoles(user._id.toHexString()),
      },
    };
  }

  async function changeUserPassword({
    userId,
    currentPassword,
    newPassword,
  }: {
    userId: string | number;
    currentPassword: string;
    newPassword: string;
  }) {
    const { User } = await db();

    const user = await User.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return {
        user: null,
        error: {
          message: "User not found",
          code: "user_not_found",
        },
      };
    }

    const isValidPassword = await comparePasswordToHashedPassword(currentPassword, user.password);

    if (!isValidPassword) {
      return {
        user: null,
        error: {
          message: "Invalid current password",
          code: "invalid_current_password",
        },
      };
    }

    const hashedPassword = await hashUserPassword(newPassword);
    const updatedUser = await User.findOneAndUpdate(
      { _id: new ObjectId(user._id) },
      { $set: { password: hashedPassword } },
      { returnDocument: "after" }
    );

    if (!updatedUser) {
      return {
        user: null,
        error: {
          message: "User not found",
          code: "user_not_found",
        },
      };
    }

    return {
      error: null,
      user: {
        id: updatedUser._id.toHexString(),
        avatar: updatedUser.avatar,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        emailVerified: updatedUser.emailVerified,
        roles: await getUserRoles(updatedUser._id.toHexString()),
      },
    };
  }

  async function deletePasswordResetToken(token: string) {
    const { Verification } = await db();
    const verificationRequest = await Verification.findOne({ token, type: "password_reset" });
    if (!verificationRequest) {
      return {
        error: {
          message: "Token not found",
          code: "token_not_found",
        },
      };
    }

    await Verification.deleteOne({ _id: verificationRequest._id });

    return { error: null };
  }

  return {
    loginUser,
    registerUser,
    getUserByEmail,
    resetUserPassword,
    changeUserPassword,
    deletePasswordResetToken,
    generatePasswordResetToken,
    validatePasswordResetToken,
    generateEmailVerificationToken,
  };
}
