// utils/crypto.ts

/**
 * Hash a string using SHA-256 (hex). Optionally salts with a secret.
 * Falls back to base64 if SubtleCrypto is unavailable.
 */
export const hashString = async (
  input: string,
  secret: string = ""
): Promise<string> => {
  const toHash = secret ? `${input}:${secret}` : input;

  try {
    if (typeof crypto !== "undefined" && crypto.subtle) {
      const enc = new TextEncoder();
      const data = enc.encode(toHash);
      const digest = await crypto.subtle.digest("SHA-256", data);
      const bytes = new Uint8Array(digest);
      return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }
  } catch {
    // ignore
  }

  // Fallback: base64 of salted input (non-cryptographic)
  try {
    return typeof btoa !== "undefined"
      ? btoa(unescape(encodeURIComponent(toHash)))
      : toHash;
  } catch {
    return toHash;
  }
};


