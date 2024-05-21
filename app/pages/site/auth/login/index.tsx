import { AlertCircle } from "lucide-react";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SiteLayout from "@/pages/_layouts/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Render from "@/components/ui/render";
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
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  return auth.authenticateWithCredentials(request, {
    redirectTo: "/dashboard",
  });
}

export default function LoginForm() {
  const isIdle = useNavigation().state === "idle";
  const isLoggingIn = useIsFormIntent("login");
  const data = useActionData<typeof action>();
  const hasError = Boolean(data?.error);

  return (
    <SiteLayout>
      <div className="h-[calc(100vh-150px)] grid place-items-center">
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <Render when={hasError && isIdle}>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{data?.error?.message}</AlertDescription>
              </Alert>
            </Render>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Enter your credentials below to login to your account</CardDescription>
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
                    placeholder="name@example.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      to="/auth/forgot-password"
                      className="ml-auto inline-block text-sm underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    placeholder="Your password"
                    type="password"
                    required
                  />
                </div>
                <IntentInput value={FormIntent.Login} />
                <Button type="submit" className="w-full" disabled={isLoggingIn}>
                  {isLoggingIn ? "Logging in..." : "Login"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link to="/auth/register" className="underline">
                  Register
                </Link>
              </div>
            </CardContent>
          </Form>
        </Card>
      </div>
    </SiteLayout>
  );
}
