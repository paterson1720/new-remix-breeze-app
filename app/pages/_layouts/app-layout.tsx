import { PropsWithChildren } from "react";
import { Form, Link } from "@remix-run/react";
import {
  ChevronDown,
  CircleUser,
  LucideLayoutDashboard,
  Menu,
  Package2,
  UserIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import StyledNavLink from "@/components/ui/styled-nav-link";
import { useBreezeAuthSession } from "@/lib/auth/context";
import FlexCol from "@/components/ui/flex-col";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import Render from "@/components/ui/render";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  title?: string;
}

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LucideLayoutDashboard,
  },
  {
    name: "Account",
    href: "/account",
    icon: UserIcon,
  },
];

export function AppLayout({ children, title }: PropsWithChildren<Props>) {
  const session = useBreezeAuthSession();

  return (
    <div className="flex flex-col min-h-screen w-full">
      <header className="sticky z-50 top-0 flex h-12 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
            <span className="bg-gradient-to-r border border-muted-foreground rounded-md px-2 text-2xl font-bold from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text">
              RB
            </span>
            <span className="sr-only">DevBreeze</span>
          </Link>
          <Render when={session.user}>
            {menuItems.map((item) => (
              <StyledNavLink key={item.href} to={item.href} className="gap-0">
                <item.icon className="h-3 w-3" />
                {item.name}
              </StyledNavLink>
            ))}
          </Render>
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
                <Package2 className="h-6 w-6" />
                <span className="sr-only">Remix-Breeze</span>
              </Link>
              <Render when={session.user}>
                {menuItems.map((item) => (
                  <StyledNavLink key={item.href} to={item.href} className="gap-0">
                    <item.icon className="h-3 w-3" />
                    {item.name}
                  </StyledNavLink>
                ))}
              </Render>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <ThemeToggle />
          <Render when={session.user}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="link">
                  <CircleUser className="h-6 w-6 rounded-full bg-secondary" />
                  <span>{session.user?.firstName}</span>
                  <ChevronDown className="h-4 w-4" />
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center gap-2">
                    <CircleUser className="h-6 w-6" />
                    <FlexCol className="gap-0">
                      <span>{session.user?.fullName}</span>
                      <span className="text-sm text-muted-foreground">{session.user?.email}</span>
                    </FlexCol>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link to="/account">Account</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Form method="post" action="/auth/logout">
                    <button type="submit" className="w-full">
                      Log out
                    </button>
                  </Form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Render>
        </div>
      </header>
      <div>
        <Render when={title}>
          <h1 className="w-full font-medium max-w-7xl mx-auto text-lg py-1 px-4 md:px-8">
            {title}
          </h1>
        </Render>
        <Separator />
        <main className="w-full mx-auto max-w-7xl flex flex-col flex-1 gap-4 p-4 md:gap-8 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
