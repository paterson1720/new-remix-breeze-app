/** @type {import("@remix-breeze/router").RouteConfig[]} */
export default [
  {
    name: "Home",
    path: "/",
    file: "pages/site/home/index.tsx",
    options: {
      index: true,
    },
  },
  {
    name: "Register",
    path: "/auth/register",
    file: "pages/site/auth/register/index.tsx",
  },
  {
    name: "Login",
    path: "/auth/login",
    file: "pages/site/auth/login/index.tsx",
  },
  {
    name: "Logout",
    path: "/auth/logout",
    file: "pages/site/auth/logout/index.ts",
  },
  {
    name: "ForgotPassword",
    path: "/auth/forgot-password",
    file: "pages/site/auth/forgot-password/index.tsx",
  },
  {
    name: "ResetPassword",
    path: "/auth/reset-password",
    file: "pages/site/auth/reset-password/index.tsx",
  },
  {
    name: "ResetPasswordEmailSent",
    path: "/auth/reset-password-email-sent",
    file: "pages/site/auth/reset-password-email-sent/index.tsx",
  },
  {
    name: "ResetPasswordSuccess",
    path: "/auth/reset-password-success",
    file: "pages/site/auth/reset-password-success/index.tsx",
  },
  {
    name: "Unauthorized",
    path: "/auth/unauthorized",
    file: "pages/site/auth/unauthorized/index.tsx",
  },
  {
    name: "About",
    path: "/about",
    file: "pages/site/about/index.tsx",
  },
  {
    name: "Account",
    path: "/account",
    file: "pages/account/index.tsx",
  },
  {
    name: "Dashboard",
    path: "/dashboard",
    file: "pages/dashboard/index.tsx",
  },
  {
    name: "SetTheme",
    path: "/action/set-theme",
    file: "pages/theme/set-theme.ts",
  },
  {
    path: "docs",
    file: "pages/docs/layout.tsx",
    children: [
      {
        name: "Docs.Index",
        path: "",
        file: "pages/docs/index.tsx",
        options: {
          index: true,
        },
      },
      {
        name: "Doc.Page",
        path: "/docs/:lang/:version/*",
        file: "pages/docs/doc-page.tsx",
      },
    ],
  },
];
