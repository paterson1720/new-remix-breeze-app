import { MetaFunction, json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { AppLayout } from "@/pages/_layouts/app-layout";
import { getAllPosts } from "@/services/post.service";

export const meta: MetaFunction = () => {
  return [{ title: "Posts List" }];
};

export async function loader() {
  const data = await getAllPosts();
  return json({ data });
}

export default function PostsList() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <AppLayout>
    <section className="w-full">
      <div className="w-full mx-auto px-4 md:px-6 flex flex-col items-center space-y-4">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Posts</h1>
          <p className="text-gray-500 md:text-xl dark:text-gray-400">
            This is a list of all posts.
          </p>
          <Link to="/posts/create" className="border p-2 rounded-md block mt-4">
            <button>Create new post</button>
          </Link>
        </div>

        <div className="w-full flex flex-col gap-4">
          {loaderData.data.map((item) => (
            <div key={item.id} className="shadow-lg rounded-lg p-4 border">
              <pre>
                <code>{JSON.stringify(item, null, 2)}</code>
              </pre>

              <div className="border-t pt-1">
                <Link to={`/posts/${item.id}`}>View</Link>
                &nbsp;|&nbsp;
                <Link to={`/posts/${item.id}/edit`}>Edit</Link>
                &nbsp;|&nbsp;
                <Form method="post" action={`/posts/${item.id}/delete`} className="inline">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      if (confirm("Are you sure you want to delete this post?")) {
                        event.currentTarget?.closest("form")?.submit();
                      }
                    }}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </Form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    </AppLayout>
  );
}