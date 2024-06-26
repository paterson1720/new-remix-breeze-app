import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import clsx from "clsx";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { PreventFlashOnWrongTheme, ThemeProvider, useTheme } from "remix-themes";
import { ToastContainer, toast } from "react-toastify";

import stylesheet from "@/styles/globals.css?url";
import { BreezeAuthSessionProvider } from "./lib/auth/context";
import { themeSessionResolver } from "./lib/theme-session.server";
import InternalServerError from "./components/internal-server-error";
import breezeToast from "./lib/breeze-toast.server";
import auth from "./lib/auth/auth.server";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: stylesheet }];

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await auth.getUserFromSession(request);
  const { getTheme } = await themeSessionResolver(request);
  return breezeToast.getWithJson(request, { user, theme: getTheme() });
}

export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>();

  return (
    <ThemeProvider specifiedTheme={data.theme} themeAction="/action/set-theme">
      <BreezeAuthSessionProvider value={{ user: data.user || null }}>
        <App />
      </BreezeAuthSessionProvider>
    </ThemeProvider>
  );
}

export function App() {
  const loaderData = useLoaderData<typeof loader>();
  const [theme] = useTheme();

  useEffect(() => {
    if (loaderData.toastData) {
      const { type, message } = loaderData.toastData;
      toast[type](message);
    }
  }, [loaderData.toastData]);

  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(loaderData.theme)} />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <ToastContainer />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  const isRouteError = isRouteErrorResponse(error);

  if (isRouteError) {
    return (
      <html lang="en" className="dark">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <Meta />
          <Links />
        </head>
        <body>
          <div className="flex flex-1 flex-col justify-center text-white">
            <div className="text-center leading-none">
              <h1 className="font-mono text-[25vw]">{error.status}</h1>
              <a
                className="inline-block text-[8vw] underline"
                href={`https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/${error.status}`}
              >
                {error.statusText}
              </a>
            </div>
          </div>
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <InternalServerError message={errorMessage} />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
