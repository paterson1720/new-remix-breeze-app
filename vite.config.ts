import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import breezeRouter from "./app/lib/breeze-router.server";

installGlobals();

export default defineConfig({
  plugins: [
    remix({
      routes: breezeRouter.routes,
    }),
    tsconfigPaths(),
  ],
});
