import React from "react";
import { Doc, getDoc, getVersions } from "@/lib/docs";
import { CACHE_CONTROL } from "@/lib/http.server";
import { HeadersFunction, LoaderFunctionArgs, SerializeFrom, json } from "@remix-run/node";
import {
  Link,
  isRouteErrorResponse,
  useLoaderData,
  useMatches,
  useParams,
  useRouteError,
} from "@remix-run/react";
import iconsHref from "@/icons.svg";
import { env } from "@/lib/env.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const baseUrl = url.protocol + "//" + url.host;
  const siteUrl = baseUrl + url.pathname;
  const ogImageUrl = baseUrl + "/images/breeze-app-dark.png";

  let version = params.version;
  if (!version) {
    const versions = await getVersions(env.DOCS_BASE_URL);
    version = versions[0];
  }

  try {
    const doc = await getDoc({
      baseUrl: env.DOCS_BASE_URL,
      lang: params.lang || "en",
      version,
      docPath: params["*"] || "index",
    });
    if (!doc) throw json(null, { status: 404 });
    return json(
      { doc, siteUrl, ogImageUrl },
      { headers: { "Cache-Control": CACHE_CONTROL.DEFAULT } }
    );
  } catch (_) {
    throw json(null, { status: 404 });
  }
}

/**
 * Inherit the caching headers from the loader so we don't cache 404s
 * */
export const headers: HeadersFunction = ({ loaderHeaders }) => {
  const headers = new Headers(loaderHeaders);
  headers.set("Vary", "Cookie");
  return headers;
};

export default function DocPage() {
  const { doc } = useLoaderData<typeof loader>();
  const ref = React.useRef<HTMLDivElement>(null);
  const matches = useMatches();
  const isDocsIndex = matches.some((match) => match.id.endsWith("$lang.$ref/index"));

  return (
    <div className="xl:flex xl:w-full xl:justify-between xl:gap-8">
      {isDocsIndex ? null : doc.headings.length > 3 ? (
        <>
          <SmallOnThisPage doc={doc} />
          <LargeOnThisPage doc={doc} />
        </>
      ) : (
        <div className="hidden xl:order-1 xl:block xl:w-56 xl:flex-shrink-0" />
      )}
      <div className="min-w-0 pt-12 xl:flex-grow xl:pt-20">
        <div ref={ref} className="markdown w-full max-w-3xl pb-[33vh]">
          <div className="md-prose" dangerouslySetInnerHTML={{ __html: doc.html }} />
        </div>
      </div>
    </div>
  );
}

function LargeOnThisPage({ doc }: { doc: SerializeFrom<Doc> }) {
  return (
    <div className="sticky top-36 order-1 mt-20 hidden max-h-[calc(100vh-9rem)] w-56 flex-shrink-0 self-start overflow-y-auto pb-10 xl:block">
      <nav className="mb-3 flex items-center font-semibold">On this page</nav>
      <ul className="md-toc flex flex-col flex-wrap gap-3 leading-[1.125]">
        {doc.headings.map((heading, i) => {
          return (
            <li key={i} className={heading.headingLevel === "h2" ? "ml-0" : "ml-4"}>
              <Link
                to={`#${heading.slug}`}
                dangerouslySetInnerHTML={{ __html: heading.html || "" }}
                className={
                  "group relative py-1 text-sm text-gray-500 decoration-gray-200 underline-offset-4 hover:underline dark:text-gray-400 dark:decoration-gray-500"
                }
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SmallOnThisPage({ doc }: { doc: SerializeFrom<Doc> }) {
  return (
    <details className="group -mx-4 flex h-full flex-col sm:-mx-6 lg:mx-0 lg:mt-4 xl:ml-80 xl:hidden">
      <summary className="_no-triangle flex cursor-pointer select-none items-center gap-2 border-b border-gray-50 bg-white px-2 py-3 text-sm font-medium hover:bg-gray-50 active:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 dark:active:bg-gray-700">
        <div className="flex items-center gap-2">
          <svg aria-hidden className="h-5 w-5 group-open:hidden">
            <use href={`${iconsHref}#chevron-r`} />
          </svg>
          <svg aria-hidden className="hidden h-5 w-5 group-open:block">
            <use href={`${iconsHref}#chevron-d`} />
          </svg>
        </div>
        <div className="whitespace-nowrap">On this page</div>
      </summary>
      <ul className="pl-9">
        {doc.headings.map((heading, i) => (
          <li key={i} className={heading.headingLevel === "h2" ? "ml-0" : "ml-4"}>
            <Link
              to={`#${heading.slug}`}
              dangerouslySetInnerHTML={{ __html: heading.html || "" }}
              className="block py-2 text-sm text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            />
          </li>
        ))}
      </ul>
    </details>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const params = useParams();
  if (isRouteErrorResponse(error)) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center">
        <h1 className="text-9xl font-bold">{error.status}</h1>
        <p className="text-lg">
          {[400, 404].includes(error.status) ? (
            <>
              There is no doc for <i className="text-gray-500">{params["*"]}</i>
            </>
          ) : (
            error.statusText
          )}
        </p>
      </div>
    );
  }
  throw error;
}
