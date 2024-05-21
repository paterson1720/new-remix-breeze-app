---
title: remix-breeze/router
order: 1
---

# `@remix-breeze/router`

## Overview

`@remix-breeze/router` is a library for defining and managing routes in a Remix application in a JSON format instead of confusing file based routing.

## Installation

```shellscript nonumber
npm install @remix-breeze/router
# or
yarn add @remix-breeze/router
```

## Usage

1. Create a file `breeze-router.server.ts` in your `app/` directory with the following content:

```ts
import { createBreezeRouter } from "@remix-breeze/router";

const breezeRouter = createBreezeRouter({
  // define your routes
  routes: [
    {
      path: "/",
      file: "pages/home/page.tsx",
      options: { index: true },
    },
    {
      path: "about",
      file: "pages/about/page.tsx",
    },
    // Nested routes example
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
  ],
});

export default breezeRouter;
```

2. Open the `vite.config.ts` file in your root directory, and setup the routes as follow:

```ts
// Import the breezeRouter instead that we created earlier
import breezeRouter from "./app/breeze-router.server";

export default defineConfig({
  plugins: [
    // Pass the routes to the remix plugin
    remix({ routes: breezeRouter.routes }),
    tsconfigPaths(),
  ],
});
```

Now you are all set.

With this setup, you can define your pages wherever you want, in the folder structure you like, and just specify your route `path` and the `file` path that it should render.

## Methods

### `createBreezeRouter(options: { routes: RouteConfig[] })`

Creates a new BreezeRouter instance.

#### Parameters

- `options.routes`: An array of `RouteConfig` objects with the following shape:

```ts
interface RouteConfig {
  name?: string;
  path: string;
  file: string;
  children?: RouteConfig[];
  options?: {
    /**
     * Should be `true` if the route `path` is case-sensitive. Defaults to
     * `false`.
     */
    caseSensitive?: boolean;
    /**
     * Should be `true` if this is an index route that does not allow child routes.
     */
    index?: boolean;
    /**
     * An optional unique id string for this route. Use this if you need to aggregate
     * two or more routes with the same route file.
     */
    id?: string;
  };
}
```

#### Returns

An object containing the following methods:

- `routes`
- `getPath`

### `breezeRouter.routes(defineRoutes: DefineRouteCallback)`

Defines the routes based on the `RouteConfig` object.

#### Parameters

- `defineRoutes`: The Remix `DefineRouteCallback`.

### `breezeRouter.getPath(name: string, options: GetPathOption)`

Gets a route path by name. Throws an error if the route is not found. Make sure to pass the "name" attribute when defining your routes in the `RouteConfig` object if you want to use this function.

#### Parameters

- `name`: The name of the route.
- `options`: The options to pass to the route.

#### Returns

The path of the route.

#### Example

Say you define a route like this in your routeConfig array:

```ts
 {
  name: "User.Edit", // the name can be anything you like, make sure they are unique
  path: "/users/:id",
  file: "pages/users/edit.tsx"
 }
```

If you want to link to it in your UI, you can do something like this:

```tsx
<Link
  to={breezeRouter.getPath("Users.Edit", {
    params: { id: 2 },
  })}
>
  Edit user
</Link>
```

#### More Example

```typescript
const path = breezeRouter.getPath("Posts.Edit", { id: "1" });
console.log(path); // Output: "/posts/1/edit"

const pathWithQuery = breezeRouter.getPath("Posts.Edit", { id: "1", query: { name: "John" } });
console.log(pathWithQuery); // Output: "/posts/1/edit?name=John"

const pathWithHash = breezeRouter.getPath("Posts.Edit", { id: "1", hash: "section-1" });
console.log(pathWithHash); // Output: "/posts/1/edit#section-1"

const pathWithQueryAndHash = breezeRouter.getPath("Posts.Edit", {
  params: { id: "1" },
  query: { title: "Hello World" },
  hash: "section-1",
});
console.log(pathWithQueryAndHash); // Output: "/posts/1/edit?name=Hello%20World#section-1"
```

## License
