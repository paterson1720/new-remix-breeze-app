import { Form } from "@remix-run/react";
import { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { AppLayout } from "@/pages/_layouts/app-layout";
import serverToast from "@/lib/breeze-toast.server";
import { createPost } from "@/services/post.service";

export const meta: MetaFunction = () => {
  return [{ title: "Create posts" }];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const formDataEntries = Object.fromEntries(formData.entries()) as any;
  // Convert _YES_ and _NO_ to boolean
  Object.keys(formDataEntries).forEach((key) => {
    if (formDataEntries[key] === "_YES_") formDataEntries[key] = true;
    else if (formDataEntries[key] === "_NO_") formDataEntries[key] = false;
  });

  const result = await createPost(formDataEntries);
  return serverToast.successRedirect({
    to: `/posts/${result.id}`,
    message: "Post created successfully",
  });
}

export default function CreatePost() {
  return (
    <AppLayout>
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Create post</h1>
        <p className="text-gray-500 md:text-xl dark:text-gray-400">Create a new post.</p>
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
        defaultValue={""}
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
        defaultValue={""}
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
        defaultValue={""}
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
              Create
            </button>
          </div>
        </div>
      </Form>
    </AppLayout>
  );
}