import { Password } from "@convex-dev/auth/providers/Password";
import type { Value } from "convex/values";

export const passwordProvider = Password({
  id: "password",
  profile: (params: Record<string, Value | undefined>) => {
    const email = params.email as string;
    return { email };
  },
});
