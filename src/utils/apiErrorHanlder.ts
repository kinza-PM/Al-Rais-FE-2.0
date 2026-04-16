import axios from "axios";

export function stripTagsSafe(input?: unknown): string {
  if (input === null || input === undefined) return "";
  const s = String(input);
  return s.replace(/<[^>]+>/g, "").trim();
}

// export function extractServerMessageFromAny(data: any): string | null {
//     if (!data) return null;

//     const candidates = [
//         // New nested error format
//         data?.message?.errorDetails?.message,
//         data?.error?.errorDetails?.message,
//         data?.response?.data?.message?.errorDetails?.message,
//         data?.response?.data?.error?.errorDetails?.message,

//         // Original error format
//         data?.response?.errorDetails?.message,
//         data?.response?.errorDetails?.title,
//         data?.details?.errorDetails?.message,
//         data?.details?.errorDetails?.title,
//         data?.errorDetails?.message,
//         data?.errorDetails?.title,
//         data?.response?.data?.details?.errorDetails?.message,
//         data?.response?.data?.details?.errorDetails?.title,

//         // Simple error format
//         data?.error,
//         data?.message,
//     ];

//     for (const c of candidates) {
//         if (c === null || c === undefined) continue;
//         if (typeof c === "string" && c.trim()) {
//             const cleaned = stripTagsSafe(c);
//             // Special handling for parameter validation errors
//             if (cleaned.includes("departureAirportCode, departureDate, and arrivalAirportCode are required")) {
//                 return "Invalid Parameters";
//             }
//             return cleaned;
//         }
//         if (Array.isArray(c) && c.length) {
//             const first = c.find((x) => typeof x === "string" && x.trim());
//             if (first) {
//                 const cleaned = stripTagsSafe(first);
//                 if (cleaned.includes("departureAirportCode, departureDate, and arrivalAirportCode are required")) {
//                     return "Invalid Parameters";
//                 }
//                 return cleaned;
//             }
//         }
//         if (typeof c === "object" && c !== null) {
//             const nested = c.message ?? c.title ?? null;
//             if (typeof nested === "string" && nested.trim()) {
//                 const cleaned = stripTagsSafe(nested);
//                 if (cleaned.includes("departureAirportCode, departureDate, and arrivalAirportCode are required")) {
//                     return "Invalid Parameters";
//                 }
//                 return cleaned;
//             }
//         }
//     }

//     const src =
//         data?.details?.errorDetails?.source ||
//         data?.response?.errorDetails?.source ||
//         data?.errorDetails?.source;
//     if (src && typeof src === "object") {
//         try {
//             const fields = Object.entries(src)
//                 .map(([k, v]) => `${k}: ${v}`)
//                 .join(", ");
//             if (fields) return fields;
//         } catch { }
//     }

//     // fallback small hint
//     try {
//         const maybe = {
//             message: data?.message,
//             code:
//                 data?.response?.errorDetails?.code ??
//                 data?.details?.errorDetails?.code ??
//                 data?.errorDetails?.code,
//             title:
//                 data?.response?.errorDetails?.title ??
//                 data?.details?.errorDetails?.title ??
//                 data?.errorDetails?.title,
//         };
//         const s = JSON.stringify(maybe);
//         if (s && s !== "{}") return s;
//     } catch { }

//     return null;
// }

export function extractServerMessageFromAny(data: any): string | null {
  if (!data) return null;

  // Check for source field with detailed errors FIRST
  const sources = [
    data?.message?.errorDetails?.source,
    data?.error?.errorDetails?.source,
    data?.response?.data?.message?.errorDetails?.source,
    data?.response?.data?.error?.errorDetails?.source,
    data?.response?.errorDetails?.source,
    data?.details?.errorDetails?.source,
    data?.errorDetails?.source,
    data?.response?.data?.details?.errorDetails?.source,
  ];

  for (const src of sources) {
    if (src && typeof src === "object") {
      try {
        // Get first error entry
        const entries = Object.entries(src);
        if (entries.length > 0) {
          const [field, errorMsg] = entries[0];

          // Parse field name to make it user-friendly
          if (typeof errorMsg === "string" && errorMsg.trim()) {
            let userFriendlyMsg = stripTagsSafe(errorMsg);

            // Handle flightSegments array indices
            if (field.includes("flightSegments[1]")) {
              // flightSegments[1] means return/arrival flight
              userFriendlyMsg = userFriendlyMsg
                .replace(/departure date/gi, "arrival date")
                .replace(/Departure date/g, "Arrival date");
            }

            return userFriendlyMsg;
          }
        }
      } catch {}
    }
  }

  const candidates = [
    // New nested error format
    data?.message?.errorDetails?.message,
    data?.error?.errorDetails?.message,
    data?.response?.data?.message?.errorDetails?.message,
    data?.response?.data?.error?.errorDetails?.message,

    // Original error format
    data?.response?.errorDetails?.message,
    data?.response?.errorDetails?.title,
    data?.details?.errorDetails?.message,
    data?.details?.errorDetails?.title,
    data?.errorDetails?.message,
    data?.errorDetails?.title,
    data?.response?.data?.details?.errorDetails?.message,
    data?.response?.data?.details?.errorDetails?.title,

    // Simple error format
    data?.error,
    data?.message,
  ];

  for (const c of candidates) {
    if (c === null || c === undefined) continue;
    if (typeof c === "string" && c.trim()) {
      const cleaned = stripTagsSafe(c);
      // Special handling for parameter validation errors
      if (
        cleaned.includes(
          "departureAirportCode, departureDate, and arrivalAirportCode are required"
        )
      ) {
        return "Invalid Parameters";
      }
      return cleaned;
    }
    if (Array.isArray(c) && c.length) {
      const first = c.find((x) => typeof x === "string" && x.trim());
      if (first) {
        const cleaned = stripTagsSafe(first);
        if (
          cleaned.includes(
            "departureAirportCode, departureDate, and arrivalAirportCode are required"
          )
        ) {
          return "Invalid Parameters";
        }
        return cleaned;
      }
    }
    if (typeof c === "object" && c !== null) {
      const nested = c.message ?? c.title ?? null;
      if (typeof nested === "string" && nested.trim()) {
        const cleaned = stripTagsSafe(nested);
        if (
          cleaned.includes(
            "departureAirportCode, departureDate, and arrivalAirportCode are required"
          )
        ) {
          return "Invalid Parameters";
        }
        return cleaned;
      }
    }
  }

  // fallback small hint
  try {
    const maybe = {
      message: data?.message,
      code:
        data?.response?.errorDetails?.code ??
        data?.details?.errorDetails?.code ??
        data?.errorDetails?.code,
      title:
        data?.response?.errorDetails?.title ??
        data?.details?.errorDetails?.title ??
        data?.errorDetails?.title,
    };
    const s = JSON.stringify(maybe);
    if (s && s !== "{}") return s;
  } catch {}

  return null;
}

/**
 * Returns `errorDetails.source` from a typical API Gateway error body (string values only).
 * Used to map server-side field validation to inline form errors.
 */
export function extractAxiosErrorDetailsSource(
  err: unknown,
): Record<string, string> | null {
  if (!axios.isAxiosError(err)) return null;
  const data =
    (err as any).response?.data ?? (err as any).data ?? (err as any).response;
  if (!data || typeof data !== "object") return null;

  const sourceObjects = [
    data?.message?.errorDetails?.source,
    data?.error?.errorDetails?.source,
    data?.response?.data?.message?.errorDetails?.source,
    data?.response?.data?.error?.errorDetails?.source,
    data?.response?.errorDetails?.source,
    data?.details?.errorDetails?.source,
    data?.errorDetails?.source,
    data?.response?.data?.details?.errorDetails?.source,
  ];

  for (const src of sourceObjects) {
    if (src && typeof src === "object" && !Array.isArray(src)) {
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(src as Record<string, unknown>)) {
        if (typeof v === "string" && v.trim()) {
          out[String(k)] = stripTagsSafe(v);
        }
      }
      if (Object.keys(out).length > 0) return out;
    }
  }
  return null;
}

export function extractErrorFromAxiosApiError(err: unknown): string {
  const strip = stripTagsSafe;
  if (axios.isAxiosError(err)) {
    if ((err as any).code === "ERR_CANCELED") {
      return `Request aborted (timeout/cancelled)`;
    }
    const data =
      (err as any).response?.data ?? (err as any).data ?? (err as any).response;
    const serverMsg = extractServerMessageFromAny(data);
    if (serverMsg) return serverMsg;
    return strip((err as any).message ?? "Something went wrong");
  }

  if (err instanceof Error && typeof err.message === "string") {
    const full = strip(err.message);
    const afterColonMatch = full.match(/[:]\s*([\s\S]+)$/);
    if (afterColonMatch && afterColonMatch[1]) {
      const candidate = afterColonMatch[1].trim();
      if (candidate.startsWith("{") || candidate.startsWith("[")) {
        try {
          const parsed = JSON.parse(candidate);
          const fromParsed = extractServerMessageFromAny(parsed);
          if (fromParsed) return fromParsed;
          return strip(JSON.stringify(parsed));
        } catch {
          return strip(candidate);
        }
      }
      return strip(candidate);
    }
    return full;
  }

  if (typeof err === "string") return strip(err);
  return "Something went wrong";
}
