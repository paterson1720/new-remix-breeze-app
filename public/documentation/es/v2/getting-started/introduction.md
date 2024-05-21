---
title: Introduction
order: 1
---

---

## Introduction

### Remix Breeze

**Remix-Breeze** is provides the perfect starting point and developer tools to ship your Remix applications like a breeze. **Remix-Breeze** provides the implementation for your application's login, registration, email verification, password reset, HTML email templates, CLI for CRUD scaffolding, and more.

Remix-Breeze is designed using Remix, Typescript, Tailwind CSS and offers a simple routing convention and a powerfull CLI for CRUD scaffolding.

### Stack

- Remix
- Prisma ORM
- SQLite by default (easily change it to any other database provider if needed)
- Tailwind CSS
- React Email (used to design the included beautiful email templates)

### Features

Here are the features you get out the the box when you start a new Remix-Breeze application:

- Full authentication flow (Register, Login, Forgot Password, Reset Password).
- A beautiful project layout to get started, easily change it if needed.
- Easy to use routing system, forget about confusing file based routing.
- A beautiful markdown documentation template, to easily build your app docs.
- An easy to use and maintanable project structure
- A powerfull CLI to quickly scaffold CRUD

Here is an example of the CRUD scaffolding CLI. Just run this single command and get a fully functional functionality to create, read, update and delete posts:

```shellscript nonumber
npm run breeze g-crud -r posts -m "title:string content:text isPublished:boolean"
```

By running this command, Remix-Breeze will automatically do the followings.

1. Create the following routes in the `app/breeze.routes.config.js` file:

   - `/posts`
   - `/posts/create`
   - `/posts/:id`
   - `/posts/:id/edit`
   - `/posts/:id/delete`

2. Create the followings files in the pages directory, with a basic UI and forms to list, edit, create, delete posts.

   - `posts/index.tsx`
   - `posts/create.tsx`
   - `posts/show.tsx`
   - `posts/edit.tsx`
   - `posts/delete.ts`

3. Add the `Post` Prisma model to the `prisma/prisma.schema` file, with the specified fields and types:

```js
model Post {
    id          String @id @default(cuid())
    title       String
    content     String
    isPublished Boolean
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
}
```

The only thing you have to do at this point is regenerate the prisma client and migration if necessary, restart your server and visit `/posts` routes to start ceating, editing, deleting posts.

### What's Next ?

- [Installation](/docs/en/getting-started/installation)
