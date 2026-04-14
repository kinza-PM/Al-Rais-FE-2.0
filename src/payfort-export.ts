const payfortConfig = {
  // RETURN_URL: `${import.meta.env.VITE_PAYFORT_TOKEN_RETURN_URL}`,
  RETURN_URL: `${import.meta.env.VITE_PAYFORT_TOKEN_RETURN_URL}?frontend_origin=${(window.location.origin)}`,
  access_code: import.meta.env.VITE_PAYFORT_ACCESS_CODE,
  merchant_identifier: import.meta.env.VITE_PAYFORT_MERCHANT_IDENTIFIER,
  sha_request_phrase: import.meta.env.VITE_PAYFORT_SHA_REQUEST_PHRASE,
  sha_response_phrase: import.meta.env.VITE_PAYFORT_SHA_RESPONSE_PHRASE,
};

export default payfortConfig;