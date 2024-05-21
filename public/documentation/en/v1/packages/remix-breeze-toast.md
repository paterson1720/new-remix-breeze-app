---
title: remix-breeze/toast
order: 2
---

# `@remix-breeze/toast`

## Introduction

The `@remix-breeze/toast` library allows you to easily create and manage flash toast notification messages in a Remix application using cookie-based session storage.

## Installation

```shellscript nonumber
npm install @remix-breeze/toast
```

## Getting Started

In a `breeze-toast.server.ts` file, create an instance using the `createBreezeToast` function.

### Creating a Breeze Toast Instance

You need to initialize the toast with cookie options, primarily a `secret` for the cookie session.

```ts
import { createBreezeToast } from "@remix-breeze/toast";

const breezeToast = createBreezeToast({
  cookie: {
    secret: "your-secret-key",
  },
});

export default breezeToast;
```

You can optionally provide a `name` for the cookie:

```ts
const toast = createBreezeToast({
  cookie: {
    name: "my-toast-cookie",
    secret: "your-secret-key",
  },
});
```

## Usage

After creating the instance and export it, you can import it and use it in your routes' loader functions and action functions.

### Example

```ts
import breezeToast from "./breeze-toast.server,ts";

export async function action({ params }: ActionFunctionArgs) {
  try {
    await deletePost(params.id);
    const headers = await breezeToast.success("Post deleted successfully");
    return json({ success: true }, { headers });
  } catch (error) {
    const headers = await breezeToast.error("An error occurred while deleting the post");
    return json({ success: false }, { headers });
  }
}
```

## Consuming the Toast Notifications on the UI

In any page you want to show your notification, you can get the toast using the `breezeToast.getData` method, return in your loader response, then use the `useLoaderData` Remix hook to access the toast data, and show it in your UI.

You can also access it and render it once in your root route, and any page will be able to show the toast notification.

### Example

In your root route `root.tsx` file, import your `breezeToast` instance, get the data in a loader function and return it.

```tsx
import breezeToast from "./breeze-toast.server";

async function loader({ request }: LoaderFunctionArgs) {
  const { toastData, headers } = await breezeToast.getData(request);
  return json({ toastData }, { headers });
}
```

Then, in the same root route `root.tsx` file, access the loader data using `useLoaderData` in your component and render the `toastData` message in the UI.

```tsx
export function App() {
  const loaderData = useLoaderData<typeof loader>();
  const toastData = loaderData.toastData;

  return (
    <html lang="en">
      <head>...</head>
      <body>
        <div className="toast-notification">
          <p>{toastData.type}</p>
          <p>{toastData.message}</p>
        </div>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
```

### Styling

Feel free to style the toast message container as you wish base on the type. The type can be `error`, `success`, `info`, `warning`.

### Use With Client Side Toast Notification Library

You can easily use it with a client side Toast Notification Library, like `react-toastify`.

Here is an example:

```tsx
import React from "react";
import breezeToast from "./breeze-toast.server";
import { ToastContainer, toast } from "react-toastify";

async function loader({ request }: LoaderFunctionArgs) {
  const { toastData, headers } = await breezeToast.getData(request);
  return json({ toastData }, { headers });
}

export function App() {
  const loaderData = useLoaderData<typeof loader>();

  {
    /* Using useEffect to show the toast notification */
  }
  React.useEffect(() => {
    if (loaderData.toastData) {
      const { type, message } = loaderData.toastData;
      toast[type](message);
    }
  }, [loaderData.toastData]);

  return (
    <html lang="en" className={clsx(theme)}>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        {/* Render the toast container */}
        <ToastContainer />
      </body>
    </html>
  );
}
```

### Methods

#### successRedirect

Adds a flash toast object to the session storage with type `success` and the specified message, committing the session object to the storage and redirecting to the specified URL.

##### Parameters

- `options`:
  - `message`: `string` - The message to display.
  - `to`: `string` - The URL to redirect to after displaying the toast.

##### Example

```ts
await breezeToast.successRedirect({
  to: "/dashboard",
  message: "This is a success message",
});
```

#### errorRedirect

Adds a flash toast object to the toast session with type `error` and the specified message, committing the session object to the storage and redirecting to the specified URL.

##### Parameters

- `options`:
  - `message`: `string` - The message to display.
  - `to`: `string` - The URL to redirect to after displaying the toast.

##### Example

```ts
await breezeToast.errorRedirect({
  to: "/dashboard",
  message: "This is an error message",
});
```

#### infoRedirect

Adds a flash toast object to the toast session with type `info` and the specified message, committing the session object to the storage and redirecting to the specified URL.

##### Parameters

- `options`:
  - `message`: `string` - The message to display.
  - `to`: `string` - The URL to redirect to after displaying the toast.

##### Example

```ts
await breezeToast.infoRedirect({
  to: "/dashboard",
  message: "This is an info message",
});
```

#### warningRedirect

Adds a flash toast object to the toast session with type `warning` and the specified message, committing the session object to the storage and redirecting to the specified URL.

##### Parameters

- `options`:
  - `message`: `string` - The message to display.
  - `to`: `string` - The URL to redirect to after displaying the toast.

##### Example

```ts
await breezeToast.warningRedirect({
  to: "/dashboard",
  message: "This is a warning message",
});
```

#### success

Adds a flash toast object to the toast session with type `success` and the specified message.

##### Parameters

- `message`: `string` - The message to display.

##### Returns

- `Promise<Headers>` - The headers object with the "Set-Cookie" property.

##### Example

```ts
export async function action({ params }: ActionFunctionArgs) {
  await deletePost(params.id);
  const headers = await breezeToast.success("Post deleted successfully");
  return json({ message: "Success" }, { headers });
}
```

#### error

Adds a flash toast object to the toast session with type `error` and the specified message.

##### Parameters

- `message`: `string` - The message to display.

##### Returns

- `Promise<Headers>` - The headers object with the "Set-Cookie" property.

##### Example

```ts
export async function action({ params }: ActionFunctionArgs) {
  try {
    await deletePost(params.id);
    const headers = await breezeToast.success("Post deleted successfully");
    return json({ message: "Success" }, { headers });
  } catch (error) {
    const headers = await breezeToast.error("An error occurred while deleting the post");
    return json({ message: "Error" }, { headers });
  }
}
```

#### info

Adds a flash toast object to the toast session with type `info` and the specified message.

##### Parameters

- `message`: `string` - The message to display.

##### Returns

- `Promise<Headers>` - The headers object with the "Set-Cookie" property.

##### Example

```ts
export async function action({ params }: ActionFunctionArgs) {
  await deletePost(params.id);
  const headers = await breezeToast.info("Some info message");
  return json({ message: "Success" }, { headers });
}
```

#### warning

Adds a flash toast object to the toast session with type `warning` and the specified message.

##### Parameters

- `message`: `string` - The message to display.

##### Returns

- `Promise<Headers>` - The headers object with the "Set-Cookie" property.

##### Example

```ts
export async function action({ params }: ActionFunctionArgs) {
  await deletePost(params.id);
  const headers = await breezeToast.warning("Some warning message");
  return json({ message: "Success" }, { headers });
}
```

#### getToastSession

Get the toast session object. When you call this function, it will return the session object. It's your responsibility to extract the toast data from the session object and commit the session object back to the storage.

##### Parameters

- `request`: `Request` - The request object.

##### Returns

- `Promise<Session>` - The session object.

##### Example

```ts
async function loader({ request }: LoaderFunctionArgs) {
  const session = await breezeToast.getToastSession(request);
  const toastData = session.get("breeze_toast");
  return json(
    { toastData },
    {
      headers: {
        "Set-Cookie": await breezeToast.sessionStorage.commitSession(session),
      },
    }
  );
}
```

#### getData

Get the toast data from the session storage and commit the session object back to the storage.

##### Parameters

- `request`: `Request` - The request object.

##### Returns

- `Promise<{toastData: {type: "success" | "error" | "info" | "warning"; message: string;}; headers: Headers}>` - An object containing the toast data and the headers object.

##### Example

```ts
async function loader({ request }: LoaderFunctionArgs) {
  const { toastData, headers } = await breezeToast.getData(request);
  return json({ toastData }, { headers });
}
```

#### getWithJson

Get the toast and add additional data to the response object. This function is useful when you want to add additional data to the response object before sending it to the client.

##### Parameters

- `request`: `Request` - The request object.
- `data`: `T` - An object containing the additional data to add to the response object.

##### Returns

- `Promise<Response>` - The response object with the "toastData" property and the additional data.

##### Example

```ts
async function loader({ request }: LoaderFunctionArgs) {
  return toast.getWithJson(request, { message: "Hello World" });
}
```

The session storage object with methods `getSession`, `commitSession`, and `destroySession`. You'll rarely need to use this unless you want to manually manipulate the toast cookie session.
