import { BreezeAuthSessionUser } from "@remix-breeze/auth";
import { PropsWithChildren, createContext, useContext } from "react";

interface BreezeAuthSessionContext {
  user: BreezeAuthSessionUser | null;
}

const context = createContext<BreezeAuthSessionContext | undefined>(undefined);

export function BreezeAuthSessionProvider({
  children,
  value,
}: PropsWithChildren<{ value: BreezeAuthSessionContext }>) {
  return <context.Provider value={value}>{children}</context.Provider>;
}

export function useBreezeAuthSession() {
  const _context = useContext(context);
  if (_context === undefined) {
    throw new Error(
      "useBreezeAuthSession must be used within a BreezeAuthSessionProvider. Make sure you wrap root component with BreezeAuthSessionProvider to get access to the auth session."
    );
  }
  return _context;
}
