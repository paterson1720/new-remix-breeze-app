import auth from "@/lib/auth/auth.server";
import { ActionFunctionArgs } from "@remix-run/node";

export function action({ request }: ActionFunctionArgs) {
  return auth.logout(request, {
    redirectTo: "/",
  });
}
