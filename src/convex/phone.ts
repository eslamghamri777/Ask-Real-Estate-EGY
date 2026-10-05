/**
 * Phone helpers shared by the site settings, the request desk and the
 * WhatsApp handoff. Kept dependency-free so both the Convex runtime and
 * "use node" actions can import it.
 */

/**
 * Collapse anything a customer or editor types into international digits.
 *
 * Egyptian numbers are stored in international form (`20…`): `01012345678`,
 * `1012345678` and `+20 10 1234 5678` all become `201012345678`. A number that
 * already carries another country code is returned as-is, so foreign customers
 * can still leave their own WhatsApp number.
 */
export function normalizeEgyptianPhone(input: string): string | undefined {
  const digits = input.replace(/\D/g, "");
  if (!digits) return undefined;

  // 0020… → 20…
  const local = digits.startsWith("00") ? digits.slice(2) : digits;

  // Egyptian local forms first — they are the ones that must be rewritten.
  if (local.length === 11 && local.startsWith("01")) return `20${local.slice(1)}`;
  if (local.length === 10 && local.startsWith("1")) return `20${local}`;

  // Anything already international (Egypt or abroad): 11–15 digits.
  if (local.length >= 11 && local.length <= 15) return local;

  return undefined;
}

/** `201012345678` → `+20 101 234 5678`, for display only. */
export function formatPhoneForDisplay(normalized: string): string {
  if (normalized.startsWith("20") && normalized.length === 12) {
    const rest = normalized.slice(2);
    return `+20 ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6)}`;
  }
  return `+${normalized}`;
}
