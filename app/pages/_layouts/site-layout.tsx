import { Fragment, PropsWithChildren, useState } from "react";
import { Link } from "@remix-run/react";
import { useBreezeAuthSession } from "@/lib/auth/context";
import Render from "@/components/ui/render";
import { ThemeToggle } from "@/components/theme-toggle";
import StyledNavLink from "@/components/ui/styled-nav-link";

const menuItem = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "About",
    href: "/about",
  },
  {
    name: "Docs",
    href: "/docs",
  },
];

export default function SiteLayout({ children }: PropsWithChildren) {
  const [menuOpen, setMenuOpen] = useState(false);
  const authSession = useBreezeAuthSession();
  const currentUser = authSession.user;

  return (
    <Fragment>
      <nav className="bg-white dark:bg-gray-950 w-full z-20 top-0 start-0 border-b border-muted-background">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="bg-gradient-to-r text-2xl lg:text-3xl font-bold from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text">
              Remix-Breeze
            </span>
          </Link>
          <div className="gap-2 flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            <ThemeToggle />

            <Render when={!currentUser}>
              <Link
                to="/auth/login"
                className="hidden md:grid text-white place-items-center bg-emerald-700 hover:bg-emerald-800 focus:ring-4 focus:outline-none focus:ring-emerald-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:focus:ring-emerald-800"
              >
                Signin
              </Link>
            </Render>
            <Render when={currentUser}>
              <Link
                to="/dashboard"
                className="hidden md:grid text-white place-items-center bg-emerald-600 hover:bg-emerald-800 focus:ring-4 focus:outline-none focus:ring-emerald-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:focus:ring-emerald-800"
              >
                Dashboard
              </Link>
            </Render>
            <button
              data-collapse-toggle="navbar-sticky"
              type="button"
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <HamburgerMenu />
            </button>
          </div>
          <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1">
            <ul className="flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
              {menuItem.map((item) => (
                <li key={item.name}>
                  <StyledNavLink to={item.href}>{item.name}</StyledNavLink>
                </li>
              ))}
            </ul>
          </div>
          <Render when={menuOpen}>
            <MobileNavbar />
          </Render>
        </div>
      </nav>
      <main>{children}</main>
    </Fragment>
  );
}

function MobileNavbar() {
  const authSession = useBreezeAuthSession();
  const currentUser = authSession.user;

  return (
    <div className="items-center justify-between w-full md:hidden md:w-auto md:order-1">
      <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
        {menuItem.map((item) => (
          <li key={item.name}>
            <Link
              to={item.href}
              className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-emerald-700 md:p-0 md:dark:hover:text-emerald-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
            >
              {item.name}
            </Link>
          </li>
        ))}
        <li>
          <Render when={!currentUser}>
            <Link
              to="/auth/login"
              className="text-white grid place-items-center bg-emerald-700 hover:bg-emerald-800 focus:ring-4 focus:outline-none focus:ring-emerald-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:focus:ring-emerald-800"
            >
              Signin
            </Link>
          </Render>
          <Render when={currentUser}>
            <Link
              to="/dashboard"
              className="text-white grid place-items-center bg-emerald-600 hover:bg-emerald-800 focus:ring-4 focus:outline-none focus:ring-emerald-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:focus:ring-emerald-800"
            >
              Dashboard
            </Link>
          </Render>
        </li>
      </ul>
    </div>
  );
}

function HamburgerMenu() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 6h16M4 12h16m-7 6h7"
      />
    </svg>
  );
}
