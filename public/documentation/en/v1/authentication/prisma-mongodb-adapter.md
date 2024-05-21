---
title: Prisma MongoDB Adapter
order: 4
---

## Prisma Models

To use the prisma adapter, make sure you have the following models in your `prisma.schema` file:

```js
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model User {
  id            String     @id @default(auto()) @map("_id") @db.ObjectId
  email         String     @unique
  emailVerified Boolean    @default(false)
  fullName      String
  firstName     String
  lastName      String
  avatar        String?
  password      String
  roles         UserRole[]
  sessions      Session[]
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}

model Role {
  id            String     @id @default(auto()) @map("_id") @db.ObjectId
  name      String     @unique
  users     UserRole[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model UserRole {
  id        String     @id @default(auto()) @map("_id") @db.ObjectId
  userId    String @db.ObjectId
  roleId    String @db.ObjectId
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      Role     @relation(fields: [roleId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model VerificationRequest {
  id        String     @id @default(auto()) @map("_id") @db.ObjectId
  identifier String
  token      String   @unique
  type       String
  expires    DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([identifier, token])
}
```

### Create a `getMongoClient` Function

```ts
import { MongoClient, ServerApiVersion } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client: MongoClient;

const globalWithMongo = global as typeof globalThis & {
  _mongoClient?: MongoClient;
};

async function getMongoClient() {
  if (process.env.NODE_ENV === "development") {
    if (!globalWithMongo._mongoClient) {
      client = new MongoClient(uri, options);
      await client.connect();
      globalWithMongo._mongoClient = client;
    }
    return globalWithMongo._mongoClient;
  }

  if (!client) {
    client = new MongoClient(uri, options);
    await client.connect();
  }

  return client;
}

export { getMongoClient };
```

### Using the Prisma MongoDB Adapter With `@remix-breeze/auth`

Once you hove your models setup correctly, you can import the `PrismaAdapter`from `@remix-breeze/auth` and instantiate breeze auth with the adapter.

- Install the library in your Remix app

```bash
npm i @remix-breeze/auth
```

- Create an `auth.server.ts` file in your `/app` directory and copy paste the following content in it.

```ts
import { MongoDBAdapter, createBreezeAuth } from "@remix-breeze/auth";
import { getMongoClient } from "../mongo-client.server";

const auth = createBreezeAuth({
  databaseAdapter: MongoDBAdapter(getMongoClient),
  cookie: {
    name: "__session",
    secret: process.env.COOKIE_SECRET!,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});

auth.use({ type: "credentials" });

export default auth;
```

Now `@remix-breeze/auth` will be able to communicate with your MongoDB database to register user, login user, reset user password etc.

### What's next ?

Follow the [`@remix-breeze/auth` tutorial](/docs/en/authentication/remix-breeze-auth) to learn how to setup your authentication flow using `@remix-breeze/auth`.
