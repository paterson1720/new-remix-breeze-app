import { z } from "zod";
import { Session, json, redirect } from "@remix-run/node";
import { mapUserToSessionUser, updateUser } from "@/services/user.service";
import auth from "@/lib/auth/auth.server";
import breezeToast from "@/lib/breeze-toast.server";
import { FormIntent } from "@/lib/types/common.types";
import { breezeValidator } from "@/lib/breeze-validator";

export const validationSchema = z.object({
  firstName: z.string().min(2).max(255),
  lastName: z.string().min(2).max(255),
});

export async function updateUserProfileAction(
  request: Request,
  userId: string,
  formData: FormData
) {
  const validation = await breezeValidator.validateFormData({
    key: FormIntent.UpdateProfile,
    zodSchema: validationSchema,
    formData,
  });

  if (validation.formErrors) {
    return json(
      { formErrors: { [FormIntent.UpdateProfile]: validation.formErrors } },
      { status: 400 }
    );
  }

  const updatedUser = await updateUser(userId, validation.data);
  const authSession = await auth.updateSession(request, {
    data: { user: mapUserToSessionUser(updatedUser) },
  });

  const sessionCookie = await auth.sessionStorage.commitSession(authSession as Session);
  const toastHeaders = await breezeToast.success("Profile updated successfully");

  return redirect("/account", {
    headers: [
      ["Set-Cookie", sessionCookie],
      ["Set-Cookie", toastHeaders["Set-Cookie"]],
    ],
  });
}
