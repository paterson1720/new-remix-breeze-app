import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { BellIcon, Building, DiamondIcon, ShieldAlert, ShieldCheck, Text } from "lucide-react";
import { AppLayout } from "@/pages/_layouts/app-layout";
import auth from "@/lib/auth/auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Remix Breeze | About" },
    { name: "description", content: "Ship amazing web apps like a breeze" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  await auth.requireAuth(request, { ifNotAuthenticatedRedirectTo: "/auth/login" });
  return null;
}

export default function Component() {
  return (
    <AppLayout title="Dashboard">
      <section className="w-full py-12 rounded-lg shadow-sm border border-muted-background">
        <div className="container space-y-12 px-4 md:px-6">
          <div className="flex flex-col items-left space-y-4 text-left">
            <div className="space-y-2">
              <span className="bg-gradient-to-r text-2xl lg:text-3xl font-bold from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text">
                Remix-Breeze
              </span>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Welcome to Your Remix-Breeze Application
              </h2>
              <p className="max-w-8xl text-gray-500 dark:text-gray-400">
                Remix-Breeze provides the perfect starting point for your next Remix application.
                Remix-Breeze is designed to help you ship amazing web apps like a breeze and provide
                a developer experience that is simple, powerful, and enjoyable. We believe you
                should love expressing your creativity through code, so we've spent time carefully
                crafting Remix-Breeze ecosystem to be a joy to use. We hope you love it.
              </p>
            </div>
          </div>
          <div className="mx-auto grid items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-8xl lg:grid-cols-3">
            <div className="grid gap-1 shadow-sm border border-muted-background rounded-sm p-4 hover:bg-foreground/5">
              <a href="https://www.remixbreeze.com/docs">
                <h3 className="text-lg font-bold">
                  <Text className="inline-block w-6 h-6 mr-2 text-green-600" />
                  Documentation
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Dive into the Remix-Breeze documentation to learn how to get started, build your
                  first app, and more. We recommend reading the documentation to get the most out of
                  the Remix-Breeze ecosystem.
                </p>
              </a>
            </div>
            <div className="grid gap-1 shadow-sm border border-muted-background rounded-sm p-4 hover:bg-foreground/5">
              <a href="https://www.remixbreeze.com/docs/en/v1/authentication/remix-breeze-auth">
                <h3 className="text-lg font-bold">
                  <ShieldAlert className="inline-block w-6 h-6 mr-2 text-green-600" />
                  Authentication
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Authentication and Registration features are built-in and ready to use, as well as
                  support for password reset and email verification. So you are free to get started
                  with what matters most: building your app.
                </p>
              </a>
            </div>
            <div className="grid gap-1 shadow-sm border border-muted-background rounded-sm p-4 hover:bg-foreground/5">
              <a href="https://www.remixbreeze.com/docs/en/v1/packages/remix-breeze-cli">
                <h3 className="text-lg font-bold">
                  <Building className="inline-block w-6 h-6 mr-2 text-green-600" />
                  CRUD Scaffolding
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Remix-Breeze comes with built-in CRUD scaffolding to help you quickly build your
                  application. Designed to help you quickly generate the code you need to create,
                  read, update, and delete a resource.
                </p>
              </a>
            </div>
            <div className="grid gap-1 shadow-sm border border-muted-background rounded-sm p-4 hover:bg-foreground/5">
              <a href="https://www.remixbreeze.com/docs/en/v1/getting-started/routing">
                <h3 className="text-lg font-bold">
                  <DiamondIcon className="inline-block w-6 h-6 mr-2 text-green-600" />
                  @remix-breeze/router
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  An optional, simple and intuitive json based routing configuration that allows you
                  to easily define your application's routes in a single{" "}
                  <em>breeze.routes.config.ts</em> file. Forget about confusing file based routing
                  conventions
                </p>
              </a>
            </div>
            <div className="grid gap-1 shadow-sm border border-muted-background rounded-sm p-4 hover:bg-foreground/5">
              <a href="https://www.remixbreeze.com/docs/en/v1/authentication/remix-breeze-auth">
                <h3 className="text-lg font-bold">
                  <ShieldCheck className="inline-block w-6 h-6 mr-2 text-green-600" />
                  @remix-breeze/auth
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This kit uses @remix-breeze/auth. A flexible and powerful authentication library
                  for Remix applications. It provides the tools you need to build secure,
                  feature-rich email/passwprd based authentication with minimal configuration.
                </p>
              </a>
            </div>
            <div className="grid gap-1 shadow-sm border border-muted-background rounded-sm p-4 hover:bg-foreground/5">
              <a href="https://www.remixbreeze.com/docs/en/v1/packages/remix-breeze-toast">
                <h3 className="text-lg font-bold">
                  <BellIcon className="inline-block w-6 h-6 mr-2 text-green-600" />
                  @remix-breeze/toast
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This kit uses @remix-breeze/toast. A simple and lightweight toast notification
                  library for Remix applications. It provides a simple way to display toast
                  notifications in your Remix application. It's easy to use and very handy.
                </p>
              </a>
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
