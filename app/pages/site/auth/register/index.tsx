import { AlertCircle } from "lucide-react";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IntentInput, useIsFormIntent } from "@/components/ui/form-intent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import SiteLayout from "@/pages/_layouts/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Render from "@/components/ui/render";
import auth from "@/lib/auth/auth.server";
import { FormIntent } from "@/lib/types/common.types";

export const meta: MetaFunction = () => {
  return [
    { title: "Remix Breeze" },
    { name: "description", content: "Ship amazing web apps like a breeze" },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  return auth.registerUser(request, {
    authenticateAndRedirectTo: "/dashboard",
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  await auth.redirectIfAuthenticated(request, { to: "/dashboard" });
  return null;
}

export default function RegisterForm() {
  const isNavigating = useNavigation().state !== "idle";
  const isRegistering = useIsFormIntent(FormIntent.Register);
  const data = useActionData<typeof action>();
  const error = data?.error;

  return (
    <SiteLayout>
      <div className="h-[calc(100vh-150px)] grid place-items-center">
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <Render when={error && !isNavigating}>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error?.message}</AlertDescription>
              </Alert>
            </Render>
            <CardTitle className="text-xl">Sign Up</CardTitle>
            <CardDescription>Enter your information to create an account</CardDescription>
          </CardHeader>
          <Form method="post">
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input id="firstName" name="firstName" placeholder="Max" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input id="lastName" name="lastName" placeholder="Robinson" required />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    placeholder="Password"
                    type="password"
                    required
                  />
                </div>
                <IntentInput value={FormIntent.Register}/>
                <Button type="submit" className="w-full">
                  {isRegistering ? "Registering..." : "Register"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link to="/auth/login" className="underline">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Form>
        </Card>
      </div>
    </SiteLayout>
  );
}
