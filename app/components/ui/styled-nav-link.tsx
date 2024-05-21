import { PropsWithChildren } from "react";
import { NavLink } from "@remix-run/react";
import { cn } from "@/lib/utils";

export default function StyledNavLink({
  to,
  end = true,
  className,
  children,
}: PropsWithChildren<{ to: string; className?: string; end?: boolean }>) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "text-foreground font-light transition-colors hover:text-emerald-700 flex gap-2 items-center",
          className,
          {
            "font-semibold text-emerald-700": isActive,
          }
        )
      }
    >
      {children}
    </NavLink>
  );
}
