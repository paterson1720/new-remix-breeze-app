import { z } from "zod";
import { requiredInProduction } from "./utils";

const envSchema = z.object({
  APP_DOMAIN: z.string().superRefine(requiredInProduction),
  COOKIE_SECRET: z.string().superRefine(requiredInProduction),
  DATABASE_URL: z.string(),
  DOCS_BASE_URL: z.string(),
  NO_CACHE: z.coerce.boolean().default(false),
});

export const env = envSchema.parse(process.env);
