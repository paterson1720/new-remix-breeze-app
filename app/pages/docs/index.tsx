import { redirect } from "@remix-run/node";

export async function loader() {
  return redirect("/docs/en/v1", { status: 301 });
}
