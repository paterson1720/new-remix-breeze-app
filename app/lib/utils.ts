import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMappedErrors<T>(errors: z.ZodError<T>["issues"]) {
  const validationErrors: Record<string, { path: string; message: string; code: string }> = {};
  for (const error of errors) {
    validationErrors[error.path.join(".")] = {
      path: error.path.join("."),
      message: error.message,
      code: error.code,
    };
  }
  return validationErrors;
}

export const requiredInProduction: z.RefinementEffect<string | undefined>["refinement"] = (
  value,
  ctx
) => {
  if (process.env.NODE_ENV === "production" && !value) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Missing required environment variable " + ctx.path.join("."),
    });
  }
};

export const requiredInDevelopment: z.RefinementEffect<string | undefined>["refinement"] = (
  value,
  ctx
) => {
  if (process.env.NODE_ENV === "development" && !value) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Missing required environment variable " + ctx.path.join("."),
    });
  }
};
