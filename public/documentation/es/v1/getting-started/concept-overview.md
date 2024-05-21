---
title: Concept Overview
order: 3
---

## Concept Overview

### Introduction

In this documentation, we'll cover some of the high-level concepts and file structure that will help you understand how Remix-Breeze is constructed.

### Folder structure

**Remix-Breeze** uses a simple and organized folder structure, to help you keep your app organized and maintainable. Here is an overview of the folder structure:

```shellscript
├── app
│   ├── components
│   ├── lib
│   ├── pages
│   ├── services
│   ├── root.tsx
│   ├── breeze.app.config.ts
│   ├── breeze.routes.config.js
│   └── styles
├── prisma
│   ├── client.ts
│   ├── schema.prisma
│   └── seed.js
├── public
│   ├── documentation
│   └── images
└── vite.config.ts
```

- **`components`**: This is where we put primitive UI components like input, button etc. and reusable component blocks.
- **`lib`**: This is where we put internal library code, utility functions and everything we need to import and use in multiple files across the app, like session instances, auth setup etc.
- **`pages`**: This where we keep all our pages and layouts
- **`services`**: This where we create services to interact with our database and external ressources and APIs. Inside this folder you will find stuff like `user.service.ts`, `email.service.ts` etc.
- **`breeze.app.config.ts`**: This is a file where we put global configuration and feature flags for our app, like our app brand name, logo url, if we want to enable account deletion etc..
- **`breeze.routes.config.ts`** This is the file where we define our routes in an easy to use and intuitive json format.
- **`prisma`** This folder is where the prisma stuff lives, like the database schema, the database seed script, the prisma client etc.
- **`public`** This folder is where we put all our public assets and app documentation markdown files that will be parsed automatically by Remix-Breeze and generate beautiful documentation like this one.

### `pages/_layouts`​

#### The Application Layout ​

After installation, your Remix-Breeze application will contain two layouts, the `app-layout.tsx` and the `site-layout.tsx` inside the `pages/_layouts` folder. The `app-layout.tsx` is used to define the layout of your application's pages that require authentication, such as your application's dashboard.

#### The Website Layout ​

In addition to the application layout, Remix-Breeze creates a `site-layout.tsx` is used to define the layout for Remix-Breeze's marketing pages, like the home page, the about pageetc. and authentication related pages, such as the login, registration, forgot password and password reset pages.

You are free to use these layouts as a starting point or customize them as you wish.

#### Dashboard

​
When a user is authenticated, he gets redirected to the `/dashboard` page of your application, the dashboard code is in `pages/dashboard/index.tsx`. You are free to use this as a starting point for building the primary "dashboard" of your application.

#### Tailwind ​

Remix-Breeze is setup with the Tailwind CSS framework. Specifically, you'll see a `postcss.config.js` file and `tailwind.config.js` file in the root of your project. It also has ShadcnUI support, so there is also a `components.json` file in your root directory. You are free to modify these files as needed for your application.

In addition, your `tailwind.config.j`s file has been pre-configured to support style the documentation pages in case you want to use the Remix-Breeze documentation feature to build the documentation of your app.

### Routing

**Remix-Breeze** uses a single file `app/breeze.routes.config.js` to easily configure the routes of your application. This file exports a default array of route objects, where you just specify the path, and which file it should render. Really easy to understand and work with. No need to remember confusing file based routing convention.

Learn more about routing in the dedicated docuemntation [Routing in Remix-Breeze](/docs/en/getting-started/routing)
