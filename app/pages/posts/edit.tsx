import serverToast from "@/lib/breeze-toast.server";
import { getPostById, updatePost } from "@/services/post.service";
import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { AppLayout } from "@/pages/_layouts/app-layout";

export const meta: MetaFunction = () => {
  return [{ title: "Edit Post" }];
};

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();

  const formDataEntries = Object.fromEntries(formData.entries()) as any;
  // Convert _YES_ and _NO_ to boolean
  Object.keys(formDataEntries).forEach((key) => {
    if (formDataEntries[key] === "_YES_") formDataEntries[key] = true;
    else if (formDataEntries[key] === "_NO_") formDataEntries[key] = false;
  });

  const id = String(params.id);
  await updatePost(id, formDataEntries);
  return serverToast.successRedirect({
    to: `/posts/${id}`,
    message: "Post updated successfully",
  });
}

export async function loader({ params }: LoaderFunctionArgs) {
  const id = String(params.id);
  const data = await getPostById(id);
  return json({ data });
}

export default function EditPost() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <AppLayout>
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Edit Post</h1>
      </div>
      <Form method="post">
        <div className="w-full flex flex-col gap-4">
        
<div className="w-full flex flex-col gap-1">
    <label htmlFor="title" className="text-sm font-semibold">
        Title *
    </label>
    <input
        id="title"
        name="title"
        defaultValue={loaderData.data?.title || ""}
        className="w-full bg-white text-black border p-2 rounded-md"
        placeholder="type here..."
        required
    />
</div>
    

<div className="w-full flex flex-col gap-1">
    <label htmlFor="description" className="text-sm font-semibold">
        Description *
    </label>
    <input
        id="description"
        name="description"
        defaultValue={loaderData.data?.description || ""}
        className="w-full bg-white text-black border p-2 rounded-md"
        placeholder="type here..."
        required
    />
</div>
    

<div className="w-full flex flex-col gap-1">
    <label htmlFor="isPublished" className="text-sm font-semibold">
    Is Published *
    </label>
    <select
        id="isPublished"
        name="isPublished"
        defaultValue={loaderData.data?.isPublished === true ? "_YES_" : "_NO_"}
        className="w-full bg-white text-black border p-2 rounded-md"
        required
    >
    <option value="" disabled>Select</option>
    <option value="_YES_">Yes</option>
    <option value="_NO_">No</option>
    </select>
</div>
            
          <div className="w-full flex flex-col gap-1">
            <button type="submit" className="border p-2 rounded-md">
              Save
            </button>
          </div>
        </div>
      </Form>
    </AppLayout>
  );
}