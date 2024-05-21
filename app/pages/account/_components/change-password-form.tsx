import { useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import FlexCol from "@/components/ui/flex-col";
import { Input } from "@/components/ui/input";
import { FORM_INTENT_KEY, useIsFormIntent } from "@/components/ui/form-intent";
import Render from "@/components/ui/render";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FormIntent } from "../../../lib/types/common.types";
import { accountAction } from "../_action";

type ChangePasswordFormError =
  | {
      [FormIntent.ChangePassword]: Record<
        string,
        {
          path: string;
          message: string;
          code: string;
        }
      >;
    }
  | undefined;

export default function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const actionData = useActionData<typeof accountAction>();
  const isIdle = useNavigation().state === "idle";
  const isChangingPassword = useIsFormIntent(FormIntent.ChangePassword);
  const formErrors = actionData?.formErrors as ChangePasswordFormError;
  const changePasswordError = formErrors?.[FormIntent.ChangePassword];

  useEffect(() => {
    if (!changePasswordError && isIdle) {
      formRef.current?.reset();
    }
  }, [changePasswordError, isIdle]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <FlexCol>
        <h3 className="text-lg text-primary">Update Password</h3>
        <p className="text-secondary-foreground">
          Ensure your account is using a long, random password to stay secure.
        </p>
      </FlexCol>
      <Card className="w-full col-span-2">
        <CardHeader>
          <CardDescription>
            Fill in the form below and save the changes to update your password.
          </CardDescription>
          <Render when={changePasswordError?.error && isIdle}>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{changePasswordError?.error?.message}</AlertDescription>
            </Alert>
          </Render>
        </CardHeader>
        <CardContent>
          <Form method="post" ref={formRef}>
            <FlexCol as="fieldset" disabled={isChangingPassword}>
              <FlexCol className="gap-1">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  defaultValue=""
                  placeholder="Current password"
                  autoComplete="off"
                />
                <Render when={changePasswordError?.currentPassword}>
                  <p className="text-sm text-destructive">
                    {changePasswordError?.currentPassword?.message}
                  </p>
                </Render>
              </FlexCol>
              <FlexCol className="gap-1">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  defaultValue=""
                  placeholder="New password"
                  autoComplete="off"
                />
                <Render when={changePasswordError?.newPassword}>
                  <p className="text-sm text-destructive">
                    {changePasswordError?.newPassword?.message}
                  </p>
                </Render>
              </FlexCol>
              <FlexCol className="gap-1">
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                <Input
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  type="password"
                  defaultValue=""
                  placeholder="Confirm new password"
                  autoComplete="off"
                />
                <Render when={changePasswordError?.confirmNewPassword}>
                  <p className="text-sm text-destructive">
                    {changePasswordError?.confirmNewPassword?.message}
                  </p>
                </Render>
              </FlexCol>
              <Button
                className="w-fit px-12"
                type="submit"
                name={FORM_INTENT_KEY}
                isLoading={isChangingPassword}
                value={FormIntent.ChangePassword}
              >
                Change Password
              </Button>
            </FlexCol>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
