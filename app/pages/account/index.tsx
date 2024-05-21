import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Separator } from "@/components/ui/separator";
import DeleteAccountSection from "./_components/delete-account-section";
import ChangePasswordForm from "./_components/change-password-form";
import UpdateProfileForm from "./_components/update-profile-form";
import { AppLayout } from "../_layouts/app-layout";
import { accountLoader } from "./_loader";
import { accountAction } from "./_action";

export const meta: MetaFunction = () => {
  return [
    { title: "Remix Breeze | About" },
    { name: "description", content: "Ship amazing web apps like a breeze" },
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  return accountLoader(args);
}

export async function action(args: LoaderFunctionArgs) {
  return accountAction(args);
}

export default function Component() {
  return (
    <AppLayout title="Account Settings">
      <section className="w-full py-12">
        <UpdateProfileForm />
        <Separator className="my-8" />
        <ChangePasswordForm />
        <Separator className="my-8" />
        <DeleteAccountSection />
      </section>
    </AppLayout>
  );
}
