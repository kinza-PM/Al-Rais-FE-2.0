const payfortConfig = {
  // If env is missing/misconfigured, default to the static return page shipped in `/public`.
  // This page is responsible for `postMessage`-ing the tokenization payload back to the app.
  RETURN_URL: (() => {
    const fallback = new URL("/payfort-token-return.html", window.location.origin)
      .toString();
    const base = import.meta.env.VITE_PAYFORT_TOKEN_RETURN_URL || fallback;
    const url = new URL(base, window.location.origin);
    url.searchParams.set("frontend_origin", window.location.origin);
    return url.toString();
  })(),
  // Tokenization endpoint (paymentPage). Default is PayFort sandbox.
  // Examples:
  // - Sandbox: https://sbcheckout.payfort.com/FortAPI/paymentPage
  // - Production: https://checkout.payfort.com/FortAPI/paymentPage
  payfort_url:
    import.meta.env.VITE_PAYFORT_URL ||
    "https://sbcheckout.payfort.com/FortAPI/paymentPage",
  access_code: import.meta.env.VITE_PAYFORT_ACCESS_CODE,
  merchant_identifier: import.meta.env.VITE_PAYFORT_MERCHANT_IDENTIFIER,
  sha_request_phrase: import.meta.env.VITE_PAYFORT_SHA_REQUEST_PHRASE,
  sha_response_phrase: import.meta.env.VITE_PAYFORT_SHA_RESPONSE_PHRASE,
  debug: String(import.meta.env.VITE_PAYFORT_DEBUG || "").toLowerCase() === "true",
};

export default payfortConfig;
