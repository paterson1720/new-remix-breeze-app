---
title: Breeze Auth Advanced
order: 2
---

# `@remix-breeze/auth`

## Advanced Usage

The [default flow and setups](/docs/en/authentication/remix-breeze-auth) will work with most apps, but if you want more control, @remix-breeze/auth allows you to provide your own adapter, sessionStorage to have full control on your authentication logic and database interaction.

### Provide a Custom Database Adapter

If you want to use a different ORM like Drizzle instead of prisma or even no ORM at all with `@remix-breeze/auth`, you can implement your own database adapter and pass it to the `createBreezeAuth` configuration options.

To create your own adapter, refer to the implementation of the [Prisma Adapter](https://github.com/paterson1720/remix-breeze/blob/main/packages/auth/lib/adapters/prisma.ts) or the [MongoDB Adapter](https://github.com/paterson1720/remix-breeze/blob/main/packages/auth/lib/adapters/mongodb.ts). Re-implement all the methods to interact with your db and return the same data structure for each methods.

Once you have your custom adapter, you can use it in the `createBreezeAuth` function to setup the authenticator instance like so:

```ts
import { createBreezeAuth } from "@remix-breeze/auth";
import MyCustomAdapter from "./my-custom-adapter-fiule-path";

const auth = createBreezeAuth({
  databaseAdapter: MyCustomAdapter(),
  cookie: {
    name: "__session",
    secret: process.env.COOKIE_SECRET!,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});

auth.use({ type: "credentials" });

export default auth;
```

Now you are using your own adapter where you have the freedom to implement all the methods to interact with your database, and logic to verify user credentials, hash user passwords etc..

### Provide a Custom Session Storage

By default, Remix-Breeze Auth uses cookie to store session data. If you want to store session
data in your database, you can provide a custom session storage in the `createBreezeAuth`
function options.

Here is an example of how you can store session data in a database.
This example uses MongoDB as the database but you can adapt it to use any other database.

```ts
import { SessionIdStorageStrategy, createSessionStorage } from "@remix-run/node";
import { ObjectId } from "mongodb";
import { BreezeAuthSessionUser } from "./breeze-auth/types";

function createDatabaseSessionStorage({ cookie }: { cookie: SessionIdStorageStrategy["cookie"] }) {
  // Configure your database client...
  async function db() {
    const dbClient = await getMongoClient();
    const db = dbClient.db();
    return {
      Session: db.collection("Session"),
    };
  }

  return createSessionStorage<{ user: BreezeAuthSessionUser }>({
    cookie,
    async createData(data, expires) {
      // `expires` is a Date after which the data should be considered
      // invalid. You could use it to invalidate the data somehow or
      // automatically purge this record from your database.
      const { Session } = await db();
      const { insertedId } = await Session.insertOne({
        data,
        createdAt: new Date(),
        updatedAt: new Date(),
        expires,
      });

      return insertedId.toHexString();
    },
    async readData(id) {
      const { Session } = await db();
      const session = await Session.findOne({ _id: new ObjectId(id) });

      if (!session) {
        return null;
      }

      return session.data;
    },
    async updateData(id, data, expires) {
      const { Session } = await db();
      await Session.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            data,
            updatedAt: new Date(),
            expires,
          },
        }
      );
    },
    async deleteData(id) {
      const { Session } = await db();
      await Session.deleteOne({ _id: new ObjectId(id) });
    },
  });
}

export default createDatabaseSessionStorage;
```

Now in your `auth.server.ts` file you can use the `createDatabaseSessionStorage`to create a custom session storage and pass it to the `createBreezeAuth` function options.

```ts
import { createBreezeAuth, MongoDBAdapter } from "@remix-breeze/auth";
import { getMongoClient } from "./mongo-client";

const breezeAuth = createBreezeAuth({
  databaseAdapter: MongoDBAdapter(getMongoClient),
  sessionStorage: createDatabaseSessionStorage({
    cookie: {
      name: "__session",
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  }),
});
```

### API Reference

Remix-Breeze Auth is a flexible authentication library designed for use with Remix. This documentation provides a detailed reference for initializing the library, managing sessions, user authentication, and handling specific authentication scenarios.

### Setup

Before using BreezeAuth, you must set up and configure the library. Use the `createBreezeAuth` function to initialize an instance with your specific configuration.

#### createBreezeAuth

```ts
import { createBreezeAuth, PrismaAdapter } from "@remix-breeze/auth";
import { prisma } from "prisma/client";

const auth = createBreezeAuth({
  databaseAdapter: PrismaAdapter(prisma),
  cookie: {
    name: "__breeze-auth-session__",
    secret: process.env.COOKIE_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});
```

Parameters:

- `breezeAuthOptions`: Configuration options for setting up BreezeAuth.

### Core Functions

Below are the core functions provided by the BreezeAuth instance.

#### sessionStorage

Manage user sessions, including retrieval, commitment, and destruction of session data.

```ts
const session = await auth.sessionStorage.getSession(request);
session.set("user", { id: 1, email: "test@email.com" });
await auth.sessionStorage.commitSession(session);
await auth.sessionStorage.destroySession(session);
```

#### use

Register an authentication provider.

```ts
auth.use({
  type: "credentials",
  sendResetPasswordEmail: async ({ user, resetLink }) => {
    // implementation
  },
  resetPasswordPageUrl: "/auth/reset-password",
});
```

#### logout

Log out a user and clear session data.

```ts
await auth.logout(request, { redirectTo: "/auth/login" });
```

#### getSession

Retrieve the session from a request.

```ts
const session = await auth.getSession(request);
```

#### registerUser

Register a new user.

```ts
const registration = await auth.registerUser(request, {
  authenticateAndRedirectTo: "/dashboard",
});
```

#### requireAuth

Require authentication for a route.

```ts
const session = await auth.requireAuth(request, {
  ifNotAuthenticatedRedirectTo: "/auth/login",
});
```

#### resetPassword

Reset a user's password.

```ts
await auth.resetPassword(request, {
  onSuccessRedirectTo: "/auth/reset-password-success",
});
```

#### requireRole

Require a specific user role to access a route.

```ts
await auth.requireRole(request, "admin", {
  redirectTo: "/auth/unauthorized",
});
```

#### redirectIfAuthenticated

Redirect already authenticated users.

```ts
await auth.redirectIfAuthenticated(request, {
  to: "/dashboard",
});
```

#### changePassword

Change the user password

```ts
const { user, error } = await auth.changeUserPassword({
  userId: "1",
  currentPassword: "password",
  newPassword: "M@res3cur3password",
});
```

#### Miscellaneous Functions

- `updateSession`: Update session data and potentially redirect.
- `getUserFromSession`: Retrieve user data from the session.
- `sendPasswordResetLink`: Send a password reset link to a user's email.
- `getCommittedSessionHeaders`: Get the Set-Cookie headers after committing a session.

### Database Adapter

BreezeAuth requires a database adapter to interface with your database. The adapter should conform to a specific interface, handling user creation, authentication, password resets, etc.
The library provides a Prisma Adapter and a MongoDB Adapter by default, you can create your own adapter by looking at one of the adapters source code as example.

- [Prisma Adapter](https://github.com/paterson1720/remix-breeze/blob/main/packages/auth/lib/adapters/prisma.ts)
- [MongoDB Adapter](https://github.com/paterson1720/remix-breeze/blob/main/packages/auth/lib/adapters/mongodb.ts)

### Types

````ts
import { SessionStorage } from "@remix-run/node";

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
    maxAge: number;
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
  deletePasswordResetToken: (token: string) => Promise<{ error: ErrorObject | null }>;
  validatePasswordResetToken: (
    token: string
  ) => Promise<TokenValidationSuccess | TokenValidationError>;
  resetUserPassword: (options: {
    token: string;
    newPassword: string;
  }) => Promise<UserDataError | UserDataSuccess<T>>;
  changeUserPassword: (options: {
    userId: string;
    currentPassword: string;
    newPassword: string;
  }) => Promise<UserDataError | UserDataSuccess<T>>;
}
````

### Error Handling

Errors are handles by returning an `error` object with `message` and `code` properties when there is an error in each adapter function, the UI can access the error message and code and provide detailed error message to the user.

### Conclusion

Remix-Breeze Auth provides comprehensive tools for managing user authentication and session management efficiently. By configuring it according to your application's needs, you can implement robust auth processes tailored to your requirements.

Follow the creator on [X (Twitter)](https://twitter.com/Paterson1720) to stay in touch and get update when new tools are released.
