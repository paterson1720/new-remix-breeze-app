/* eslint-disable @typescript-eslint/no-explicit-any */
import { PropsWithChildren } from "react";

export default function Render({ children, when }: PropsWithChildren<{ when: any }>) {
  return when ? children : null;
}
