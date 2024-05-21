import SiteLayout from "@/pages/_layouts/site-layout";
import type { MetaFunction } from "@remix-run/node";

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
            <p className="text-gray-500 md:text-xl dark:text-gray-400">
              This is the example about page, feel free to edit it in the{" "}
              <em className="text-orange-600">
                <code>'pages/site/about/index.tsx'</code>
              </em>{" "}
              file.
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
