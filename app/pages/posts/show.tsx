import { getPostById } from "@/services/post.service";
import { LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { AppLayout } from "@/pages/_layouts/app-layout";

export const meta: MetaFunction = () => {
  return [{ title: "Post View" }];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const id = String(params.id);
  const data = await getPostById(id);
  if (!data) throw new Error("Post not found");
  return json({ data });
}

export default function AdminAnnouncements() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <AppLayout>
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Single Post View</h1>
        <p className="text-gray-500 md:text-xl dark:text-gray-400">
          This is a single post view.
        </p>
      </div>
      <div>
        <Link to="/posts">Back to list</Link>&nbsp;|&nbsp;
        <Link to={`/posts/${loaderData.data.id}/edit`}>Edit</Link>
      </div>
      <div className="shadow-lg rounded-lg p-4 border">
        <pre>
          <code>{JSON.stringify(loaderData.data, null, 2)}</code>
        </pre>
      </div>
    </AppLayout>
  );
}