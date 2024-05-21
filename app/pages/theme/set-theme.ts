import { themeSessionResolver } from "@/lib/theme-session.server";
import { createThemeAction } from "remix-themes";

export const action = createThemeAction(themeSessionResolver);
