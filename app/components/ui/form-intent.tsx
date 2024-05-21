import { useNavigation } from "@remix-run/react";

export const FORM_INTENT_KEY = "form_intent";

/**
 * ----------------------------------------------------------------------
 * UseFormIntent
 * ----------------------------------------------------------------------
 * Returns true if the form "intent" is the same as the provided intent argument. For this
 * helper to work, you need to add a hidden input field with the name "form_intent"
 * in your form or use the convenient "IntentInput" component in your form.
 */
export function useIsFormIntent(intent: string) {
  const navigation = useNavigation();
  return navigation.formData?.get(FORM_INTENT_KEY) === intent;
}

/**
 * ----------------------------------------------------------------------
 * IntentInput
 * ----------------------------------------------------------------------
 * A hidden input field to include in your form to track the form "intent".
 */
export function IntentInput({ value }: { value: string }) {
  return <input type="hidden" name={FORM_INTENT_KEY} value={value} />;
}
