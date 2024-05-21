import { FORM_INTENT_KEY } from "@/components/ui/form-intent";
import auth from "@/lib/auth/auth.server";
import { FormIntent } from "@/lib/types/common.types";
import { LoaderFunctionArgs } from "@remix-run/node";
import { updateUserProfileAction } from "./_form-actions/update-user-profile";
import changeUserPasswordAction from "./_form-actions/change-user-password";
import { deleteAccountAction } from "./_form-actions/delete-account";

export async function accountAction({ request }: LoaderFunctionArgs) {
  let session = await auth.requireAuth(request, {
    ifNotAuthenticatedRedirectTo: "/auth/login",
  });

  const user = session.get("user")!;
  const formData = await request.formData();
  const intent = formData.get(FORM_INTENT_KEY) as string;

  switch (intent) {
    case FormIntent.UpdateProfile:
      return updateUserProfileAction(request, user.id, formData);
    case FormIntent.ChangePassword:
      return changeUserPasswordAction(user.id, formData);
    case FormIntent.DeleteAccount:
      return deleteAccountAction(request, user.id);
    default:
      throw new Error("Invalid form intent");
  }
}
