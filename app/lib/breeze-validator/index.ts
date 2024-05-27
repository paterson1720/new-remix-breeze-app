import { z } from "zod";

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

export const breezeValidator = {
  validateFormData: async <T extends z.ZodType>(params: {
    key: string;
    formData: FormData;
    zodSchema: T;
  }) => {
    const { key, formData, zodSchema } = params;
    const formEntriesObj = Object.fromEntries(formData.entries());
    const parseResult = zodSchema.safeParse(formEntriesObj);

    if (parseResult.error) {
      const errors = getMappedErrors(parseResult.error.issues);
      return {
        data: null,
        formErrors: { [key]: errors },
      };
    }

    return {
      data: parseResult.data as z.infer<T>,
      formErrors: null,
    };
  },
};
