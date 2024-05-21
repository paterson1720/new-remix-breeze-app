import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { FORM_INTENT_KEY, useIsFormIntent } from "@/components/ui/form-intent";
import { Button } from "@/components/ui/button";
import FlexCol from "@/components/ui/flex-col";
import Flex from "@/components/ui/flex";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Render from "@/components/ui/render";
import { FormIntent } from "../../../lib/types/common.types";
import { accountAction } from "../_action";
import { accountLoader } from "../_loader";

type UpdateProfileFormError =
  | {
      [FormIntent.UpdateProfile]: Record<
        string,
        {
          path: string;
          message: string;
          code: string;
        }
      >;
    }
  | undefined;

export default function UpdateProfileForm() {
  const loaderData = useLoaderData<typeof accountLoader>();
  const actionData = useActionData<typeof accountAction>();
  const isUpdatingProfile = useIsFormIntent(FormIntent.UpdateProfile);
  const formErrors = actionData?.formErrors as UpdateProfileFormError;
  const updateProfileError = formErrors?.[FormIntent.UpdateProfile];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <FlexCol>
        <h3 className="text-lg text-primary">Profile Information</h3>
        <p className="text-secondary-foreground">Basic info, like your name, email and avatar.</p>
      </FlexCol>
      <Card className="w-full col-span-2">
        <CardHeader>
          <CardDescription>
            Fill in the form below and save the changes to update your profile information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post">
            <FlexCol as="fieldset" disabled={isUpdatingProfile}>
              <Avatar className="w-12 h-12">
                <AvatarImage
                  src={loaderData.user.avatar || undefined}
                  alt={loaderData.user.firstName}
                />
                <AvatarFallback>
                  {loaderData.user.firstName.charAt(0) + loaderData.user.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Flex className="gap-4 flex-col lg:flex-row">
                <FlexCol className="flex-1 gap-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="firstName"
                    placeholder="First Name"
                    defaultValue={loaderData.user.firstName}
                    minLength={1}
                    pattern="\S+.*"
                    required
                  />
                  <Render when={updateProfileError?.firstName}>
                    <p className="text-sm text-destructive">
                      First Name {updateProfileError?.firstName?.message}
                    </p>
                  </Render>
                </FlexCol>
                <FlexCol className="flex-1 gap-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    name="lastName"
                    placeholder="Last Name"
                    defaultValue={loaderData.user.lastName}
                    minLength={2}
                    pattern="\S+.*"
                    required
                  />
                  <Render when={updateProfileError?.lastName}>
                    <p className="text-sm text-destructive">
                      Last Name {updateProfileError?.lastName?.message}
                    </p>
                  </Render>
                </FlexCol>
              </Flex>
              <FlexCol className="flex-1 gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={loaderData.user.email}
                  placeholder="Email"
                  className="text-secondary-foreground"
                  disabled
                />
              </FlexCol>
              <Button
                className="w-fit px-12"
                type="submit"
                name={FORM_INTENT_KEY}
                value={FormIntent.UpdateProfile}
                isLoading={isUpdatingProfile}
              >
                <span>Save</span>
              </Button>
            </FlexCol>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
