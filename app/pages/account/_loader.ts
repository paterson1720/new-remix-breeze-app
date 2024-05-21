import auth from "@/lib/auth/auth.server";
import breezeToast from "@/lib/breeze-toast.server";
import { LoaderFunctionArgs } from "@remix-run/node";

export async function accountLoader({ request }: LoaderFunctionArgs) {
  const session = await auth.requireAuth(request, {
    ifNotAuthenticatedRedirectTo: "/auth/login",
  });

  const user = session.get("user")!;
  return breezeToast.getWithJson(request, { user });
}
