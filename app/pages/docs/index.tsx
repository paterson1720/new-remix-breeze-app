import { getVersions } from "@/lib/docs";
import { env } from "@/lib/env.server";
import { redirect } from "@remix-run/node";

export async function loader() {
  const versions = await getVersions(env.DOCS_BASE_URL);
  const latestVersion = versions[0];
  return redirect(`/docs/en/${latestVersion}`, { status: 301 });
}
