import { z } from "zod";
import auth from "@/lib/auth/auth.server";
import { json } from "@remix-run/node";
import breezeToast from "@/lib/breeze-toast.server";
import { getMappedErrors } from "@/lib/utils";
import { FormIntent } from "../../../lib/types/common.types";

export const validationSchema = z
  .object({
    currentPassword: z
      .string({ message: "Current password must be a string" })
      .refine((value) => value.trim().length > 0, {
        message: "Current password must not be empty",
      }),
    newPassword: z
      .string({ message: "Password must be a string" })
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one digit")
      .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
    confirmNewPassword: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "'New Password' and 'Confirm New Password' do not match",
    path: ["confirmNewPassword"],
  });

export default async function changeUserPasswordAction(userId: string, formData: FormData) {
  const formEntriesObj = Object.fromEntries(formData.entries());

  const parseResult = validationSchema.safeParse(formEntriesObj);
  if (parseResult.error) {
    const errors = getMappedErrors(parseResult.error.issues);
    return json({ formErrors: { [FormIntent.ChangePassword]: errors } }, { status: 400 });
  }

  const { error } = await auth.changePassword({
    userId,
    currentPassword: parseResult.data.currentPassword,
    newPassword: parseResult.data.newPassword,
  });

  if (error) {
    return json({ formErrors: { [FormIntent.ChangePassword]: { error } } }, { status: 400 });
  }

  return breezeToast.successRedirect({
    to: "/account",
    message: "Password updated successfully",
  });
}
