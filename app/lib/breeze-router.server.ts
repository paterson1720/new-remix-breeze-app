import { createBreezeRouter } from "@remix-breeze/router";
import routesConfig from "../breeze.routes.config";

const breezeRouter = createBreezeRouter({
  routes: routesConfig,
});

export default breezeRouter;
