import { Session, redirect } from "@remix-run/node";
import auth from "@/lib/auth/auth.server";
import breezeToast from "@/lib/breeze-toast.server";
import { deleteUser } from "@/services/user.service";

export async function deleteAccountAction(request: Request, userId: string) {
  await deleteUser(userId);

  const authSession = await auth.getSession(request);
  const sessionCookie = await auth.sessionStorage.destroySession(authSession as Session);
  const toastHeaders = await breezeToast.success("Account deleted successfully!");

  return redirect("/", {
    headers: [
      ["Set-Cookie", sessionCookie],
      ["Set-Cookie", toastHeaders["Set-Cookie"]],
    ],
  });
}
