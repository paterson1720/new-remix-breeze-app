---
title: Routing
order: 4
---

# Routing in Remix-Breeze

**Remix-Breeze** uses a single file `app/breeze.routes.config.js` to easily configure the routes of your application. This file exports a default array of route objects, where you just specify the path, and which file it should render. Really easy to understand and work with. No need to remember confusing file based routing convention.

Here is an example:

```text lines=[3]
app/
├── breeze.routes.config.js
└── root.tsx
```

```js
/** @type {import("app/lib/remix-breeze-router/types").RouteConfig[]} */
export default [
  {
    path: "/",
    file: "pages/home/index.tsx",
    options: { index: true },
  },
  {
    path: "/auth/register",
    file: "pages/auth/register/index.tsx",
  },
  {
    path: "/auth/login",
    file: "pages/auth/login/index.tsx",
  },
  {
    path: "/admin",
    file: "pages/admin/layout.tsx",
    children: [
      {
        path: "",
        file: "pages/admin/index.tsx",
        options: { index: true },
      },
      {
        path: "/admin/users",
        file: "pages/admin/users/index.tsx",
      },
      {
        path: "/admin/users/:id/edit",
        file: "pages/admin/users/edit.tsx",
      },
    ],
  },
];
```

In this example, we define the index route `/` and specify that it should serve the `pages/index.tsx` page file, when a user visits the home page.

Also we can have nested routes by specifying a children array of nested routes. For example the `/admin` path has `/admin/users`, `/admin/users/:id/edit` as children routes.

<docs-info>
When you have nested routes, make sure the parent route has an `<Outlet />` in order to render child routes. [Learn more about nested routes and outlets here](https://remix.run/docs/en/main/start/tutorial#nested-routes-and-outlets)
</docs-info>

With this convention, you can define your pages anywhere in the `app/` folder and just pass the path to the `file` property of the route object.

<docs-info>
You can still use the Remix file based routing if you want to, or even use both the file based routing and the Remix-Breeze routing convention and your routes will be merged together. But we strongly recommend sticking with the Remix-Breeze routing convention.
</docs-info>
