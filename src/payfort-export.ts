const payfortConfig = {
  RETURN_URL: (() => {
    const fallback = new URL(
      "/payfort-token-return.html",
      window.location.origin,
    ).toString();
    const base =
      import.meta.env.VITE_PAYFORT_TOKEN_RETURN_URL?.trim() || fallback;
    const url = new URL(base, window.location.origin);
    url.searchParams.set("frontend_origin", window.location.origin);
    return url.toString();
  })(),
  access_code: import.meta.env.VITE_PAYFORT_ACCESS_CODE,
  merchant_identifier: import.meta.env.VITE_PAYFORT_MERCHANT_IDENTIFIER,
  sha_request_phrase: import.meta.env.VITE_PAYFORT_SHA_REQUEST_PHRASE,
  sha_response_phrase: import.meta.env.VITE_PAYFORT_SHA_RESPONSE_PHRASE,
};

export default payfortConfig;
