import { useCallback, useEffect, useRef, useState } from "react";
import { PayFortUtils } from "../utils/payfort";
import payfortConfig from "../payfort-export";
import { VITE_PAYFORT_PAYMENT_PAGE_URL } from "../config/publicEnv";

type TokenPayload = any;

type InitiateOptions = {
  cardNumber: string; // digits-only
  expiry: string; // YYMM e.g. "2605"
  cvv: string;
  cardHolder: string;
  // optional extras
  extra?: Record<string, any>;
};

export function usePayFortTokenization() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const listenerRef = useRef<((e: MessageEvent) => void) | null>(null);
  const cleanupTimerRef = useRef<number | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [tokenResponse, setTokenResponse] = useState<TokenPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  // cleanup helper - remove iframe and listener
  const cleanup = () => {
    if (listenerRef.current) {
      window.removeEventListener(
        "message",
        listenerRef.current as EventListener
      );
      listenerRef.current = null;
    }
    if (iframeRef.current) {
      try {
        document.body.removeChild(iframeRef.current);
      } catch (_) {}
      iframeRef.current = null;
    }
    if (cleanupTimerRef.current) {
      window.clearTimeout(cleanupTimerRef.current);
      cleanupTimerRef.current = null;
    }
    setIsLoading(false);
  };

  // returns a promise that resolves with payload from payfort
  const initiateTokenization = useCallback(
    async (opts: InitiateOptions & { returnUrl?: string }) => {
      setIsLoading(true);
      setError(null);
      setTokenResponse(null);

      return new Promise<TokenPayload>((resolve, reject) => {
        try {
          const merchant_reference = PayFortUtils.generateMerchantReference();
          const expectedMerchantReference = merchant_reference;
          let resolved = false;
          const params: Record<string, string> = {
            service_command: "TOKENIZATION",
            access_code: payfortConfig.access_code,
            merchant_identifier: payfortConfig.merchant_identifier,
            merchant_reference,
            language: "en",
            return_url: opts.returnUrl ?? (payfortConfig.RETURN_URL as string),
          };

          const signature = PayFortUtils.generateSignature(
            params,
            payfortConfig.sha_request_phrase
          );

          const fields: Record<string, string> = {
            ...params,
            signature,
            card_number: opts.cardNumber,
            expiry_date: opts.expiry,
            card_security_code: opts.cvv,
            card_holder_name: opts.cardHolder,
            ...(opts.extra || {}),
          };

          // Create hidden iframe instead of popup
          const iframe = document.createElement("iframe");
          iframe.name = "payfortHiddenFrame";
          iframe.style.position = "fixed";
          iframe.style.top = "-9999px";
          iframe.style.left = "-9999px";
          iframe.style.width = "1px";
          iframe.style.height = "1px";
          iframe.style.border = "none";
          iframe.style.opacity = "0";
          iframe.style.pointerEvents = "none";

          document.body.appendChild(iframe);
          iframeRef.current = iframe;

          // create form
          const form = document.createElement("form");
          form.method = "POST";
          form.action = VITE_PAYFORT_PAYMENT_PAGE_URL;
          form.target = "payfortHiddenFrame";

          Object.keys(fields).forEach((k) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = k;
            input.value = fields[k];
            form.appendChild(input);
          });

          document.body.appendChild(form);

          // message handler
          const handler = (e: MessageEvent) => {
            try {
              const payload = e.data;
              if (!payload) return;

              if (
                payload.merchant_reference &&
                payload.merchant_reference !== expectedMerchantReference
              ) {
                return;
              }

              // Verify signature if provided in payload
              if (payload && payload.signature) {
                const ok = PayFortUtils.verifyResponseSignature(
                  payload,
                  payfortConfig.sha_response_phrase
                );
                if (!ok) {
                  const msg = "PayFort response signature verification failed.";
                  setError(msg);
                  reject(new Error(msg));
                  cleanup();
                  return;
                }
              }

              if (!resolved) {
                resolved = true;
                setTokenResponse(payload);
                resolve(payload);
                cleanup();
              }
            } catch (err) {
              const msg =
                (err as Error).message ||
                "Failed to handle tokenization response.";
              setError(msg);
              reject(err);
              cleanup();
            }
          };

          listenerRef.current = handler;
          window.addEventListener("message", handler);

          // submit the form into the hidden iframe
          form.submit();

          // remove form after short delay
          cleanupTimerRef.current = window.setTimeout(() => {
            try {
              form.remove();
            } catch (_) {}
          }, 1500);

          // timeout safety: if no response after 30 seconds
          const timeoutId = window.setTimeout(() => {
            if (!resolved) {
              const msg = "Tokenization timed out after 30 seconds.";
              setError(msg);
              reject(new Error(msg));
              cleanup();
            }
          }, 30000);

          cleanupTimerRef.current = timeoutId;
        } catch (err) {
          setIsLoading(false);
          setError((err as Error).message || String(err));
          reject(err);
          cleanup();
        }
      });
    },
    []
  );

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const closeIframe = () => cleanup();

  return {
    initiateTokenization,
    tokenResponse,
    isLoading,
    error,
    closePopup: closeIframe, // keeping same name for backward compatibility
  };
}
