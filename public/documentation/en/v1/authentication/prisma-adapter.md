---
title: Prisma Adapter
order: 3
---

## Prisma Models

To use the prisma adapter, make sure you have the following models in your `prisma.schema` file:

```js
model User {
  id            String     @id @default(cuid())
  email         String     @unique
  emailVerified Boolean    @default(false)
  fullName      String
  firstName     String
  lastName      String
  avatar        String?
  password      String
  roles         UserRole[]
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}

model Role {
  id        String     @id @default(cuid())
  name      String     @unique
  users     UserRole[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model UserRole {
  id        String   @id @default(cuid())
  userId    String
  roleId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      Role     @relation(fields: [roleId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model VerificationRequest {
  id         String   @id @default(cuid())
  identifier String
  token      String   @unique
  type       String
  expires    DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([identifier, token])
}
```

These models are tested with the `sqlite` and `postgresql` prisma datasource provider, you might slightly need to change the default `id` field type based on the provider you are using.

For example if you are using mongodb as your provider, the `id` fields should be defined like this:

```ts
model ModelName {
  id            String     @id @default(auto()) @map("_id") @db.ObjectId
  // other fields...
}
```

### Using the Prisma Adapter With `@remix-breeze/auth`

Once you hove your models setup correctly, you can import the `PrismaAdapter`from `@remix-breeze/auth` and instantiate breeze auth with the adapter.

- Install the library in your Remix app

```bash
npm i @remix-breeze/auth
```

- Create an `auth.server.ts` file in your `/app` directory and copy paste the following content in it.

```ts
import { createBreezeAuth, PrismaAdapter } from "@remix-breeze/auth";
import { prisma } from "../prisma/client";

const auth = createBreezeAuth({
  databaseAdapter: PrismaAdapter(prisma),
  cookie: {
    name: "__session",
    secret: process.env.COOKIE_SECRET!,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});

auth.use({ type: "credentials" });

export default auth;
```

Now `@remix-breeze/auth` will be able to communicate with your database to register user, login user, reset user password etc.

### What's next ?

Follow the [`@remix-breeze/auth` tutorial](/docs/en/authentication/remix-breeze-auth) to learn how to setup your authentication flow using `@remix-breeze/auth`.
