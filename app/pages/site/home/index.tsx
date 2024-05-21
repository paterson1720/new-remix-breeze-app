import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import SiteLayout from "@/pages/_layouts/site-layout";
import { useBreezeAuthSession } from "@/lib/auth/context";

export const meta: MetaFunction = () => {
  return [
    { title: "Remix Breeze" },
    { name: "description", content: "Ship amazing web apps like a breeze" },
  ];
};

export default function Component() {
  const session = useBreezeAuthSession();

  return (
    <SiteLayout>
      <section className="w-full py-12 md:py-24">
        <div className="w-full mx-auto px-4 md:px-6 flex flex-col items-center space-y-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-6xl font-bold tracking-tighter flex flex-col">
              {/* <span className="text-emerald-500 text-7xl">Remix Breeze</span> */}
              <span className="bg-gradient-to-r font-bold lg:text-8xl from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text">
                Remix-Breeze
              </span>
              <span>Effortlessly Build Amazing Web Apps</span>
            </h1>
            <p className="text-gray-500 md:text-xl mt-12 dark:text-gray-400 max-w-3xl mx-auto">
              Remix-Breeze is an opinionated stack built on top of Remix. We’ve already laid the
              foundation with an expressive, elegant codebase.
            </p>
            <p className="text-gray-500 md:text-xl dark:text-gray-400 max-w-3xl mx-auto">
              It includes a powerful CLI to scaffold common features like CRUD operations and more —
              empowering you to quickly create amazing web apps, without headaches.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md bg-emerald-600 px-8 text-sm font-medium text-gray-50 shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 "
              to="/docs"
            >
              Documentation
            </Link>
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md text-emerald-600 px-8 text-sm font-medium shadow transition-colors hover:bg-emerald-50/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
              to="/auth/login"
            >
              Try the Demo
            </Link>
          </div>
          <pre>
            <code>{JSON.stringify(session, null, 2)}</code>
          </pre>
        </div>
      </section>
    </SiteLayout>
  );
}
