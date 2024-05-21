import { Link, json, useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SiteLayout from "@/pages/_layouts/site-layout";
import { Button } from "@/components/ui/button";
import auth from "@/lib/auth/auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Remix Breeze | Password Reset Success" },
    { name: "description", content: "Ship amazing web apps like a breeze" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  await auth.redirectIfAuthenticated(request, { to: "/dashboard" });
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  return json({ email });
}

export default function ResetPasswordForm() {
  const { email } = useLoaderData<typeof loader>();

  return (
    <SiteLayout>
      <div className="h-[calc(100vh-150px)] grid place-items-center">
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Success!</CardTitle>
            <CardDescription>
              Your password has been reset successfully. You can now login to your account using
              your email <span className="font-bold">{decodeURIComponent(email || "")}</span> and
              your new password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/auth/login" className="mt-4">
              <Button variant="default" className="w-full">
                Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </SiteLayout>
  );
}
