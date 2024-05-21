---
title: Mongoose Adapter
order: 5
---

## Setup

Follow the step to setup mongoose to work properly with Remix Breeze Auth.

### Setup Mongoose Connection

Create a `mongoose.server.ts` File with the following content

```ts
import mongoose from "mongoose";

const globalWithDb = global as typeof globalThis & {
  __db?: typeof mongoose;
};

let db: typeof mongoose;

async function connect() {
  if (db) return db;

  if (process.env.NODE_ENV === "production") {
    db = await mongoose.connect(process.env.MONGODB_URI!);
  } else {
    // in development, need to store the db connection in a global variable
    // this is because the dev server purges the require cache on every request
    // and will cause multiple connections to be made
    if (!globalWithDb.__db) {
      globalWithDb.__db = await mongoose.connect(process.env.MONGODB_URI!);
    }
    db = globalWithDb.__db;
  }
  return db;
}

connect();

export { mongoose, connect };
```

## Mongoose Models

To use the mongoose adapter, make sure you have the following models

```ts
import { mongoose } from "../mongoose.server.ts";

// User Schema
const userSchema = new mongoose.Schema()<User>(
  {
    email: { type: String, unique: true, required: true },
    emailVerified: { type: Boolean, default: false },
    fullName: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    avatar: { type: String },
    password: { type: String, required: true },
    roles: { type: [String], required: true, default: ["user"] },
  },
  { timestamps: true }
);

const UserModel = mongoose.model.User || mongoose.model("User", userSchema);

// VerificationRequest Schema
const verificationRequestSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true },
    token: { type: String, unique: true, required: true },
    type: { type: String, required: true },
    expires: { type: Date, required: true },
  },
  {
    timestamps: true,
    index: { fields: { identifier: 1, token: 1 }, unique: true },
  }
);

const VerificationRequestModel =
  mongoose.model.VerificationRequest ||
  mongoose.model("VerificationRequest", verificationRequestSchema);

export { UserModel, VerificationRequestModel };
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

### Using the MongooseAdapter Adapter With `@remix-breeze/auth`

Once you hove your models setup correctly, you can import the `MongooseAdapter`from `@remix-breeze/auth` and instantiate breeze auth with the adapter.

- Install the library in your Remix app

```bash
npm i @remix-breeze/auth
```

- Create an `auth.server.ts` file in your `/app` directory and copy paste the following content in it.

```ts
import { MongooseAdapter, createBreezeAuth } from "@remix-breeze/auth";
import { getMongoClient } from "../mongo-client.server";

const auth = createBreezeAuth({
  databaseAdapter: MongooseAdapter(getMongoClient),
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
