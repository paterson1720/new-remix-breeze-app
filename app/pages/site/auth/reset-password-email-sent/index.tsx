import { json, useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SiteLayout from "@/pages/_layouts/site-layout";
import auth from "@/lib/auth/auth.server";

export const meta: MetaFunction = () => {
  return [{ title: "Remix Breeze | Reset Link Email Sent" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  await auth.redirectIfAuthenticated(request, { to: "/dashboard" });
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  return json({ email });
}

export default function ResetPasswordEmailSent() {
  const { email } = useLoaderData<typeof loader>();

  return (
    <SiteLayout>
      <div className="h-[calc(100vh-150px)] grid place-items-center">
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Email Sent</CardTitle>
            <CardDescription>
              An email has been sent to your email address{" "}
              <span className="font-bold"> {decodeURIComponent(email || "")}</span> with
              instructions on how to reset your password.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </SiteLayout>
  );
}
