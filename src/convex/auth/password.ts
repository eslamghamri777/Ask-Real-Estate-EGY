import { Password } from "@convex-dev/auth/providers/Password";
import type { Value } from "convex/values";

/**
 * Password provider with sign-up profile fields:
 * firstName, lastName, phone are collected in the UI and stored on the user.
 * `name` stays in sync (e.g. "Ahmed Hassan") and defaults to the email local part.
 */
export const passwordProvider = Password({
  id: "password",
  profile: (params: Record<string, Value | undefined>) => {
    const email = params.email as string;
    const firstName = ((params.firstName as string) ?? "").trim();
    const lastName = ((params.lastName as string) ?? "").trim();
    const phone = ((params.phone as string) ?? "").trim() || undefined;

    const name =
      [firstName, lastName].filter(Boolean).join(" ") ||
      email.split("@")[0] ||
      "User";

    return { email, name, ...(phone ? { phone } : {}) };
  },
});
