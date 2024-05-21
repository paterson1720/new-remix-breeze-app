import { useRef } from "react";
import { Form } from "@remix-run/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import FlexCol from "@/components/ui/flex-col";
import { IntentInput } from "@/components/ui/form-intent";
import { FormIntent } from "@/lib/types/common.types";
import { useDisclosure } from "@/lib/hooks/use-disclosure";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DeleteAccountSection() {
  const formRef = useRef<HTMLFormElement>(null);
  const deleteDialogDisclosure = useDisclosure();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <FlexCol>
        <h3 className="text-lg text-primary">Delete Account</h3>
        <p className="text-secondary-foreground">
          Permanently delete your account and all of your data.
        </p>
      </FlexCol>
      <FlexCol className="w-full col-span-2">
        <Card>
          <CardHeader>
            <CardDescription>
              Once your account is deleted, all of your data will be permanently removed. Before
              deleting your account, please download any data or information that you wish to
              retain.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FlexCol className="gap-4">
              <Form method="post" ref={formRef}>
                <IntentInput value={FormIntent.DeleteAccount} />
                <Button
                  variant="destructive"
                  className="w-fit px-12"
                  type="button"
                  onClick={deleteDialogDisclosure.open}
                >
                  Delete Account
                </Button>
              </Form>
            </FlexCol>
          </CardContent>
        </Card>
      </FlexCol>
      <AlertDialog open={deleteDialogDisclosure.isOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your account? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => void deleteDialogDisclosure.close()}>
              No, keep it
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                formRef.current?.submit();
                deleteDialogDisclosure.close();
              }}
            >
              <span>Yes, delete it</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
