import { AlertCircle } from "lucide-react";
import { Form, json, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
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
  const status = searchParams.get("status");
  const email = searchParams.get("email");
  return json({ status, email });
}

export async function action({ request }: ActionFunctionArgs) {
  return auth.sendPasswordResetLink(request, {
    onSuccessRedirectTo: "/auth/reset-password-email-sent",
    expireLinkAfterMinutes: 30,
  });
}

export default function ForgotPasswordForm() {
  const isIdle = useNavigation().state === "idle";
  const isSubmitting = useIsFormIntent(FormIntent.ForgotPassword);
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const hasError = Boolean(actionData?.error);

  if (loaderData.status === "email_sent") {
    return (
      <SiteLayout>
        <div className="h-[calc(100vh-150px)] grid place-items-center">
          <Card className="mx-auto max-w-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Email Sent</CardTitle>
              <CardDescription>
                An email has been sent to your email address{" "}
                <span className="font-bold"> {decodeURIComponent(loaderData.email || "")}</span>{" "}
                with instructions on how to reset your password.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="h-[calc(100vh-150px)] max-w-xl mx-auto grid place-items-center">
        <Card className="mx-auto max-w-sm">
          {/* ---Warning--- */}
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              For this feature to work, you need to provide an email service to send the password
              reset link to the user email. Check the code snippet in the{" "}
              <strong>lib/auth/auth.server.ts</strong> file to see how to do this.
            </AlertDescription>
          </Alert>
          {/* ---Warning End--- */}
          <CardHeader>
            <Render when={hasError && isIdle}>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{actionData?.error?.message}</AlertDescription>
              </Alert>
            </Render>
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription>
              Enter your email address below to receive a password reset link
            </CardDescription>
          </CardHeader>
          <fieldset disabled={isSubmitting}>
            <Form method="post">
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                  <IntentInput value={FormIntent.ForgotPassword} />
                  <Button type="submit" className="w-full">
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </CardContent>
            </Form>
          </fieldset>
        </Card>
      </div>
    </SiteLayout>
  );
}
