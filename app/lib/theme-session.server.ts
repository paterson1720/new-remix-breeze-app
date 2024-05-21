import { createCookieSessionStorage } from "@remix-run/node";
import { createThemeSessionResolver } from "remix-themes";
import { env } from "./env.server";

const isProduction = process.env.NODE_ENV === "production";
const appDomain = env.APP_DOMAIN;

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "theme",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: ["s3cr3t"],
    domain: isProduction ? appDomain : undefined,
    secure: isProduction,
  },
});

export const themeSessionResolver = createThemeSessionResolver(sessionStorage);
