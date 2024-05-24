import { createBreezeRouter } from "@remix-breeze/router";
import routesConfig from "../breeze.routes.config";

const breezeRouter = createBreezeRouter({
  routes: routesConfig.concat([
    {
      name: "CatchAll",
      path: "*",
      file: "pages/not-found.tsx",
    },
  ]),
});

export default breezeRouter;
