import { createBreezeToast } from "@remix-breeze/toast";
import { env } from "./env.server";

const breezeToast = createBreezeToast({
  cookie: {
    name: "__toast_session",
    secret: env.COOKIE_SECRET!,
  },
});

export default breezeToast;
