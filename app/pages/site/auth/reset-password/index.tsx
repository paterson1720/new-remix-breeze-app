import { AlertCircle } from "lucide-react";
import { Form, Link, json, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SiteLayout from "@/pages/_layouts/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Render from "@/components/ui/render";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IntentInput, useIsFormIntent } from "@/components/ui/form-intent";
import auth from "@/lib/auth/auth.server";
import { FormIntent } from "@/lib/types/common.types";

export const meta: MetaFunction = () => {
  return [
    { title: "Remix Breeze | Signin" },
    { name: "description", content: "Ship amazing web apps like a breeze" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  await auth.redirectIfAuthenticated(request, { to: "/dashboard" });

  const { searchParams } = new URL(request.url);

  const token = searchParams.get("token");
  const email = searchParams.get("email");
  if (!token || !email) {
    return json({
      token,
      email,
      status: "invalid_url",
    });
  }

  const { error } = await auth.validatePasswordResetToken(token);
  return json({
    token,
    email,
    status: !error ? "valid_token" : "invalid_token",
  });
}

export async function action({ request }: ActionFunctionArgs) {
  return auth.resetPassword(request, {
    onSuccessRedirectTo: "/auth/reset-password-success",
  });
}

export default function ResetPasswordForm() {
  const isIdle = useNavigation().state === "idle";
  const isSubmitting = useIsFormIntent(FormIntent.ResetPassword);
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const { token, email } = loaderData;

  if (["invalid_url", "invalid_token"].includes(loaderData?.status)) {
    return (
      <SiteLayout>
        <div className="h-[calc(100vh-150px)] grid place-items-center">
          <Card className="mx-auto max-w-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
              <CardDescription>
                The reset link is invalid or has expired. Please request a new reset link to reset
                your password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/auth/forgot-password" className="mt-4">
                <Button variant="default" className="w-full">
                  Request Reset Link
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="h-[calc(100vh-150px)] grid place-items-center">
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <Render when={actionData?.error && isIdle}>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{actionData?.error?.message}</AlertDescription>
              </Alert>
            </Render>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>Please fill in the form below to reset your password</CardDescription>
          </CardHeader>
          <Form method="post">
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={email!}
                    placeholder="name@example.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="Enter your new password"
                    autoComplete="off"
                    minLength={6}
                    maxLength={255}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password-confirm">Confirm Password</Label>
                  <Input
                    id="password-confirm"
                    name="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    autoComplete="off"
                    minLength={6}
                    maxLength={255}
                    required
                  />
                </div>
                <input type="hidden" name="token" value={token!} />
                <IntentInput value={FormIntent.ResetPassword} />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </CardContent>
          </Form>
        </Card>
      </div>
    </SiteLayout>
  );
}
