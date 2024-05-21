import serverToast from "@/lib/breeze-toast.server";
import { deletePost } from "@/services/post.service";
import { ActionFunctionArgs } from "@remix-run/node";

export async function action({ params }: ActionFunctionArgs) {
  const id = String(params.id);
  await deletePost(id);
  return serverToast.successRedirect({
    to: "/posts",
    message: "Post deleted successfully",
  });
}