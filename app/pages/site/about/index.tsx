import SiteLayout from "@/pages/_layouts/site-layout";
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Remix Breeze | About" },
    { name: "description", content: "Ship amazing web apps like a breeze" },
  ];
};

export default function Component() {
  return (
    <SiteLayout>
      <section className="w-full py-12">
        <div className="w-full mx-auto px-4 md:px-6 flex flex-col items-center space-y-4">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">About Page</h1>
            <p className="text-gray-500 md:text-xl dark:text-gray-400">This is the about page.</p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
              to="#"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
