import "@/styles/docs.css";
import * as React from "react";
import cx from "clsx";
import { json } from "@remix-run/node";
import { useNavigate } from "react-router-dom";
import type { LoaderFunctionArgs, HeadersFunction } from "@remix-run/node";

import {
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useMatches,
  useNavigation,
  useParams,
  useResolvedPath,
  matchPath,
} from "@remix-run/react";

import iconsHref from "@/icons.svg";
import { DetailsMenu, DetailsPopup } from "@/components/ui/details-menu";
import { getMenu, getVersions, type Doc } from "@/lib/docs";
import { CACHE_CONTROL } from "@/lib/http.server";
import { ThemeToggle } from "@/components/theme-toggle";
import { env } from "@/lib/env.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { lang = "en" } = params;
  const baseUrl = env.DOCS_BASE_URL!;

  let version = params.version;
  if (!version) {
    const versions = await getVersions(baseUrl);
    version = versions[0];
  }

  const menuCacheKey = `${baseUrl}_:_${lang}_:_${version}`;
  const [menu, versions] = await Promise.all([getMenu(menuCacheKey), getVersions(baseUrl)]);
  const [latestVersion] = versions;

  return json({
    menu,
    versions,
    lang,
    currentVersion: version || latestVersion,
  });
};

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": CACHE_CONTROL.DEFAULT,
    Vary: "Cookie",
  };
};

export default function DocsLayout() {
  const location = useLocation();
  const detailsRef = React.useRef<HTMLDetailsElement>(null);

  React.useEffect(() => {
    const details = detailsRef.current;
    if (details && details.hasAttribute("open")) {
      details.removeAttribute("open");
    }
  }, [location]);

  const docsContainer = React.useRef<HTMLDivElement>(null);
  useCodeBlockCopyButton(docsContainer);

  return (
    <div className="[--header-height:theme(spacing.16)] [--nav-width:theme(spacing.72)]">
      <div className="sticky top-0 z-20">
        <Header />
        {/* <VersionWarningMobile /> */}
        <NavMenuMobile />
      </div>
      <div>
        <InnerContainer>
          <div className="block lg:flex">
            <NavMenuDesktop />
            <div
              ref={docsContainer}
              className={cx(
                // add scroll margin to focused elements so that they aren't
                // obscured by the sticky header
                "[&_*:focus]:scroll-mt-[8rem] lg:[&_*:focus]:scroll-mt-[5rem]",
                // Account for the left navbar
                "min-h-[80vh] lg:ml-3 lg:w-[calc(100%-var(--nav-width))]",
                "lg:pl-6 xl:pl-10 2xl:pl-12"
              )}
            >
              <Outlet />
              <div className="pt-8 sm:pt-10 lg:pt-12">
                <Footer />
              </div>
            </div>
          </div>
        </InnerContainer>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="flex justify-between gap-4 border-t border-t-gray-50 py-4 text-sm text-gray-400 dark:border-gray-800">
      <div className="sm:flex sm:items-center sm:gap-2 lg:gap-4">
        <div>
          &copy;{" "}
          <a className="hover:underline" href="/">
            Remix-Breeze.
          </a>
        </div>
        <div className="hidden sm:block">•</div>
        <div>
          Docs and examples licensed under{" "}
          <a className="hover:underline" href="https://opensource.org/licenses/MIT">
            MIT
          </a>
        </div>
      </div>
      <div>
        <EditLink />
      </div>
    </div>
  );
}

function Header() {
  const navigate = useNavigate();

  return (
    <div
      className={cx(
        "relative border-b border-gray-100/50 bg-white text-black dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100",
        // This hides some of the underlying text when the user scrolls to the
        // bottom which results in the overscroll bounce
        "before:absolute before:bottom-0 before:left-0 before:hidden before:h-[500%] before:w-full before:bg-inherit lg:before:block"
      )}
    >
      <InnerContainer>
        <div className="relative z-20 flex h-[--header-height] w-full items-center justify-between py-3">
          <div className="flex w-full items-center justify-between gap-4 sm:gap-8 md:w-auto">
            <Link
              className="flex"
              onContextMenu={(event) => {
                event.preventDefault();
                navigate("/brand");
              }}
              to="/"
            >
              <span className="bg-gradient-to-r text-2xl font-bold from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text">
                Remix-Breeze
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <VersionSelect />
              <ThemeToggle />
              {/* <DocSearchSection className="lg:hidden" /> */}
              <HeaderMenuMobile className="md:hidden" />
            </div>
          </div>
          <div className="flex gap-8">
            <div className="hidden items-center md:flex">
              <HeaderMenuLink to="/docs">Docs</HeaderMenuLink>
              <HeaderMenuLink to="https://full-stack-kit.dev">Next.js Kits</HeaderMenuLink>
            </div>
            <div className="flex items-center gap-2">
              <HeaderLink
                href="https://github.com/paterson1720/remix-breeze"
                svgId="github"
                label="View code on GitHub"
                title="View code on GitHub"
                svgSize="24x24"
              />
              <HeaderLink
                href="https://discord.gg/W7774VAbSM"
                svgId="discord"
                label="Chat on Discord"
                title="Chat on Discord"
                svgSize="24x24"
              />
            </div>
          </div>
        </div>
      </InnerContainer>
    </div>
  );
}

function VersionSelect() {
  const { versions, lang, currentVersion } = useLoaderData<typeof loader>();

  // This is the same default, hover, focus style as the ColorScheme trigger
  const baseClasses =
    "bg-gray-100 hover:bg-gray-200 [[open]>&]:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:[[open]>&]:bg-gray-700";

  return (
    <DetailsMenu className="relative">
      <summary
        className={`_no-triangle relative flex h-[40px] cursor-pointer list-none items-center justify-center gap-1 rounded-full px-3 text-sm ${baseClasses}`}
      >
        <div>{currentVersion}</div>
        <svg aria-hidden className="-mr-1 h-5 w-5">
          <use href={`${iconsHref}#chevrons-up-down`} />
        </svg>
      </summary>
      <DetailsPopup>
        <div className="flex flex-col gap-px">
          <VersionsLabel label="Versions" />
          {versions.map((version) => (
            <VersionLink key={version} to={`/docs/${lang}/${version}`}>
              {version}
            </VersionLink>
          ))}
        </div>
      </DetailsPopup>
    </DetailsMenu>
  );
}

function VersionsLabel({ label }: { label: string }) {
  return (
    <div className="flex w-full items-center gap-2 px-2 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300">
      {label}
    </div>
  );
}

function VersionLink({ to, children }: { to: string; children: React.ReactNode }) {
  const isActive = useIsActivePath(to);
  const className = cx(
    "flex w-full items-center gap-2 py-2 px-2 rounded-sm text-sm transition-colors duration-100",
    isActive
      ? "text-black bg-blue-200 dark:bg-blue-800 dark:text-gray-100"
      : "text-gray-700 hover:bg-blue-200/50 hover:text-black dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-blue-800/50"
  );

  return (
    <a href={to} className={className}>
      {children}
    </a>
  );
}

function HeaderMenuLink({
  className = "",
  to,
  children,
}: {
  to: string;
  className?: string;
  children: React.ReactNode;
}) {
  const isActive = useIsActivePath(to);

  return (
    <Link
      prefetch="intent"
      to={to}
      className={cx(
        className,
        "p-2 py-2.5 text-sm leading-none underline-offset-4 hover:underline md:p-3",
        isActive
          ? "text-black underline decoration-black dark:text-gray-200 dark:decoration-gray-200"
          : "text-gray-500 decoration-gray-200 dark:text-gray-400 dark:decoration-gray-500"
      )}
    >
      {children}
    </Link>
  );
}

function HeaderMenuMobile({ className = "" }: { className: string }) {
  // This is the same default, hover, focus style as the VersionSelect
  const baseClasses =
    "bg-gray-100 hover:bg-gray-200 [[open]>&]:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:[[open]>&]:bg-gray-700";

  return (
    <DetailsMenu className={cx("relative cursor-pointer", className)}>
      <summary
        className={cx(baseClasses, "_no-triangle grid h-10 w-10 place-items-center rounded-full")}
      >
        <svg className="h-5 w-5">
          <use href={`${iconsHref}#menu`} />
        </svg>
      </summary>
      <DetailsPopup>
        <div className="flex flex-col">
          <HeaderMenuLink to="/docs">Docs</HeaderMenuLink>
          <HeaderMenuLink to="/blog">Blog</HeaderMenuLink>
          <HeaderMenuLink to="/showcase">Showcase</HeaderMenuLink>
          <HeaderMenuLink to="/resources">Resources</HeaderMenuLink>
        </div>
      </DetailsPopup>
    </DetailsMenu>
  );
}

function HeaderLink({
  className = "",
  href,
  svgId,
  label,
  svgSize,
  title,
}: {
  className?: string;
  href: string;
  svgId: string;
  label: string;
  svgSize: string;
  title?: string;
}) {
  const [width, height] = svgSize.split("x");

  return (
    <a
      href={href}
      className={cx(
        `hidden h-10 w-10 place-items-center text-black hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-50 md:grid`,
        className
      )}
      title={title}
    >
      <span className="sr-only">{label}</span>
      <svg aria-hidden style={{ width: `${width}px`, height: `${height}px` }}>
        <use href={`${iconsHref}#${svgId}`} />
      </svg>
    </a>
  );
}

function NavMenuMobile() {
  const doc = useDoc();
  return (
    <div className="lg:hidden">
      <DetailsMenu className="group relative flex h-full flex-col">
        <summary
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          className="_no-triangle flex cursor-pointer select-none items-center gap-2 border-b border-gray-50 bg-white px-2 py-3 text-sm font-medium hover:bg-gray-50 active:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 dark:active:bg-gray-700"
        >
          <div className="flex items-center gap-2">
            <svg aria-hidden className="h-5 w-5 group-open:hidden">
              <use href={`${iconsHref}#chevron-r`} />
            </svg>
            <svg aria-hidden className="hidden h-5 w-5 group-open:block">
              <use href={`${iconsHref}#chevron-d`} />
            </svg>
          </div>
          <div className="whitespace-nowrap font-bold">{doc ? doc.attrs.title : "Navigation"}</div>
        </summary>
        <div className="absolute h-[66vh] w-full overflow-auto overscroll-contain border-b bg-white p-2 pt-5 shadow-2xl dark:border-gray-700 dark:bg-gray-900 dark:shadow-black">
          <Menu />
        </div>
      </DetailsMenu>
    </div>
  );
}

function NavMenuDesktop() {
  return (
    <div
      className={cx(
        "sticky bottom-0 top-16 -ml-3 hidden w-[--nav-width] flex-col gap-3 self-start overflow-auto pb-10 pr-5 pt-5 lg:flex",
        // Account for the height of the top nav
        "h-[calc(100vh-var(--header-height))]"
      )}
    >
      {/* <DocSearchSection /> */}
      <div className="[&_*:focus]:scroll-mt-[6rem]">
        <Menu />
      </div>
    </div>
  );
}

function Menu() {
  const { menu, lang, currentVersion } = useLoaderData<typeof loader>();

  return menu ? (
    <nav>
      <ul>
        {menu.map((category) => {
          // Technically we can have a category that has content (and thus
          // needs it's own link) _and_ has children, so needs to be a details
          // element. It's ridiculous, but it's possible.
          const menuCategoryType = category.hasContent
            ? category.children.length > 0
              ? "linkAndDetails"
              : "link"
            : "details";

          return (
            <li key={category.attrs.title} className="mb-3">
              {menuCategoryType === "link" ? (
                <MenuSummary as="div">
                  <MenuCategoryLink to={category.slug}>{category.attrs.title}</MenuCategoryLink>
                </MenuSummary>
              ) : (
                <MenuCategoryDetails className="group" slug={category.slug}>
                  <MenuSummary>
                    {menuCategoryType === "linkAndDetails" ? (
                      <MenuCategoryLink to={category.slug}>{category.attrs.title}</MenuCategoryLink>
                    ) : (
                      category.attrs.title
                    )}
                    <svg aria-hidden className="h-5 w-5 group-open:hidden">
                      <use href={`${iconsHref}#chevron-r`} />
                    </svg>
                    <svg aria-hidden className="hidden h-5 w-5 group-open:block">
                      <use href={`${iconsHref}#chevron-d`} />
                    </svg>
                  </MenuSummary>
                  {category.children.map((doc) => {
                    return (
                      <MenuLink key={doc.slug} to={`/docs/${lang}/${currentVersion}/${doc.slug}`}>
                        {doc.attrs.title} {doc.attrs.new && "🆕"}
                      </MenuLink>
                    );
                  })}
                </MenuCategoryDetails>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  ) : (
    <div className="bold text-gray-300 dark:text-gray-400">Failed to load menu</div>
  );
}

type MenuCategoryDetailsType = {
  className?: string;
  slug: string;
  children: React.ReactNode;
};

function MenuCategoryDetails({ className, slug, children }: MenuCategoryDetailsType) {
  const isActivePath = useIsActivePath(slug);
  // By default only the active path is open
  const [isOpen, setIsOpen] = React.useState(isActivePath);

  // Auto open the details element, useful when navigating from the home page
  React.useEffect(() => {
    if (isActivePath) {
      setIsOpen(true);
    }
  }, [isActivePath]);

  return (
    <details
      className={cx(className, "relative flex cursor-pointer flex-col")}
      open={isOpen}
      onToggle={(e) => {
        // Synchronize the DOM's state with React state to prevent the
        // details element from being closed after navigation and re-evaluation
        // of useIsActivePath
        setIsOpen(e.currentTarget.open);
      }}
    >
      {children}
    </details>
  );
}

// This components attempts to keep all of the styles as similar as possible
function MenuSummary({
  children,
  as = "summary",
}: {
  children: React.ReactNode;
  as?: "summary" | "div";
}) {
  const sharedClassName = "rounded-2xl px-3 py-3 transition-colors duration-100";
  const wrappedChildren = (
    <div className="flex h-5 w-full items-center justify-between text-base font-semibold leading-[1.125]">
      {children}
    </div>
  );

  if (as === "summary") {
    return (
      <summary
        className={cx(
          sharedClassName,
          "_no-triangle block select-none",
          "outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-800  dark:focus-visible:ring-gray-100",
          "hover:bg-gray-50 active:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 dark:active:bg-gray-700"
        )}
      >
        {wrappedChildren}
      </summary>
    );
  }

  return (
    <div
      className={cx(
        sharedClassName,
        "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-blue-800 dark:has-[:focus-visible]:ring-gray-100"
      )}
    >
      {wrappedChildren}
    </div>
  );
}

function MenuCategoryLink({ to, children }: { to: string; children: React.ReactNode }) {
  const isActive = useIsActivePath(to);

  return (
    <Link
      prefetch="intent"
      to={to}
      className={cx(
        "outline-none focus-visible:text-blue-brand dark:focus-visible:text-blue-400",
        isActive
          ? "text-blue-brand dark:text-blue-brand"
          : "hover:text-blue-brand dark:hover:text-blue-400 "
      )}
    >
      {children}
    </Link>
  );
}

function MenuLink({ to, children }: { to: string; children: React.ReactNode }) {
  const isActive = useIsActivePath(to);
  return (
    <Link
      prefetch="intent"
      to={to}
      className={cx(
        "group relative my-px flex min-h-[2.25rem] items-center rounded-2xl border-transparent px-3 py-2 text-sm",
        "outline-none transition-colors duration-100 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-800  dark:focus-visible:ring-gray-100",
        isActive
          ? ["text-black dark:text-gray-100", "bg-blue-200 dark:bg-blue-800"]
          : [
              "text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-100",
              "hover:bg-blue-100 dark:hover:bg-blue-800/50",
            ]
      )}
    >
      {children}
    </Link>
  );
}

function EditLink() {
  const doc = useDoc();
  const params = useParams();
  const isEditableRef = params.ref === "main" || params.ref === "dev";

  if (!doc || !isEditableRef) {
    return null;
  }

  const repoUrl = "https://github.com/paterson1720/remix-breeze";
  // TODO: deal with translations when we add them with params.lang
  const editUrl = `${repoUrl}/edit/${params.ref}/${doc.slug}.md`;

  return (
    <a className="flex items-center gap-1 hover:underline" href={editUrl}>
      Edit
      <svg aria-hidden className="h-4 w-4">
        <use href={`${iconsHref}#edit`} />
      </svg>
    </a>
  );
}

function InnerContainer({ children }: { children: React.ReactNode }) {
  return <div className="m-auto px-4 sm:px-6 lg:px-8 xl:max-w-[90rem]">{children}</div>;
}

function hasDoc(data: unknown): data is { doc: Doc } {
  return !!data && typeof data === "object" && "doc" in data;
}

function useDoc(): Doc | null {
  const data = useMatches().at(-1)?.data;
  if (!hasDoc(data)) return null;
  return data.doc;
}

function useIsActivePath(to: string) {
  const { pathname } = useResolvedPath(to);
  const navigation = useNavigation();
  const currentLocation = useLocation();
  const navigating = navigation.state === "loading" && navigation.formData == null;
  const location = navigating ? navigation.location! : currentLocation;
  const match = matchPath(pathname + "/*", location.pathname);
  return Boolean(match);
}

function useCodeBlockCopyButton(ref: React.RefObject<HTMLDivElement>) {
  const location = useLocation();
  React.useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const codeBlocks = container.querySelectorAll(
      "[data-code-block][data-lang]:not([data-nocopy])"
    );
    const buttons = new Map<
      HTMLButtonElement,
      { listener: (event: MouseEvent) => void; to: number }
    >();

    for (const codeBlock of codeBlocks) {
      const button = document.createElement("button");
      const label = document.createElement("span");
      button.type = "button";
      button.dataset.codeBlockCopy = "";
      button.addEventListener("click", listener);

      label.textContent = "Copy code to clipboard";
      label.classList.add("sr-only");
      button.appendChild(label);
      codeBlock.appendChild(button);
      buttons.set(button, { listener, to: -1 });

      // eslint-disable-next-line no-inner-declarations
      function listener(event: MouseEvent) {
        event.preventDefault();
        const pre = codeBlock.querySelector("pre");
        const text = pre?.textContent;
        if (!text) return;
        navigator.clipboard
          .writeText(text)
          .then(() => {
            button.dataset.copied = "true";
            const to = window.setTimeout(() => {
              window.clearTimeout(to);
              if (button) {
                button.dataset.copied = undefined;
              }
            }, 3000);
            if (buttons.has(button)) {
              buttons.get(button)!.to = to;
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }
    return () => {
      for (const [button, props] of buttons) {
        button.removeEventListener("click", props.listener);
        button.parentElement?.removeChild(button);
        window.clearTimeout(props.to);
      }
    };
  }, [ref, location.pathname]);
}
