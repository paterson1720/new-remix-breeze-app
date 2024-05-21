import { Link } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SiteLayout from "@/pages/_layouts/site-layout";
import { Button } from "@/components/ui/button";

export const meta: MetaFunction = () => {
  return [{ title: "Remix Breeze | Unauthorized" }];
};

export default function Unauthorized() {
  return (
    <SiteLayout>
      <div className="h-[calc(100vh-150px)] grid place-items-center">
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Unauthorized!</CardTitle>
            <CardDescription>You are not authorized to access this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/" className="mt-4">
              <Button variant="default" className="w-full">
                Go Back
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </SiteLayout>
  );
}
