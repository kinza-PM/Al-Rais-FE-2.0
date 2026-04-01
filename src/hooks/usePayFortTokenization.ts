import { useCallback, useEffect, useRef, useState } from "react";
import { PayFortUtils } from "../utils/payfort";
import payfortConfig from "../payfort-export";

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
  const removeFormTimerRef = useRef<number | null>(null);
  const timeoutTimerRef = useRef<number | null>(null);
  const loadGuardTimerRef = useRef<number | null>(null);
  const popupRef = useRef<Window | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [tokenResponse, setTokenResponse] = useState<TokenPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const redactForLog = (fields: Record<string, string>) => {
    const redacted: Record<string, string> = { ...fields };
    const mask = (v: string, keepStart = 6, keepEnd = 4) => {
      const s = String(v || "");
      if (s.length <= keepStart + keepEnd) return "***";
      return `${s.slice(0, keepStart)}***${s.slice(-keepEnd)}`;
    };

    if ("card_number" in redacted) redacted.card_number = mask(redacted.card_number, 6, 4);
    if ("card_security_code" in redacted) redacted.card_security_code = "***";
    if ("signature" in redacted) redacted.signature = "***";
    return redacted;
  };

  // cleanup helper - remove iframe and listener
  const cleanup = () => {
    if (listenerRef.current) {
      window.removeEventListener(
        "message",
        listenerRef.current as EventListener
      );
      listenerRef.current = null;
    }
    try {
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    } catch (_) {}
    popupRef.current = null;
    if (iframeRef.current) {
      try {
        document.body.removeChild(iframeRef.current);
      } catch (_) {}
      iframeRef.current = null;
    }
    if (removeFormTimerRef.current) {
      window.clearTimeout(removeFormTimerRef.current);
      removeFormTimerRef.current = null;
    }
    if (timeoutTimerRef.current) {
      window.clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }
    if (loadGuardTimerRef.current) {
      window.clearTimeout(loadGuardTimerRef.current);
      loadGuardTimerRef.current = null;
    }
    setIsLoading(false);
  };

  // returns a promise that resolves with payload from payfort
  const initiateTokenization = useCallback(
    async (opts: InitiateOptions & { returnUrl?: string }) => {
      setIsLoading(true);
      setError(null);
      setTokenResponse(null);

      const openCenteredPopup = (name: string, width = 500, height = 700) => {
        const dualScreenLeft =
          window.screenLeft !== undefined ? window.screenLeft : window.screenX;
        const dualScreenTop =
          window.screenTop !== undefined ? window.screenTop : window.screenY;
        const screenWidth =
          window.innerWidth ||
          document.documentElement.clientWidth ||
          screen.width;
        const screenHeight =
          window.innerHeight ||
          document.documentElement.clientHeight ||
          screen.height;
        const systemZoom = screenWidth / window.screen.availWidth;
        const left = (screenWidth - width) / 2 / systemZoom + dualScreenLeft;
        const top = (screenHeight - height) / 2 / systemZoom + dualScreenTop;
        const features = `scrollbars=yes, width=${width / systemZoom}, height=${
          height / systemZoom
        }, top=${top}, left=${left}`;
        return window.open("about:blank", name, features);
      };

      type Mode = "iframe" | "popup";

      const runOnce = (mode: Mode = "iframe") =>
        new Promise<TokenPayload>((resolve, reject) => {
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

          let targetName = "payfortHiddenTarget";
          if (mode === "iframe") {
            // Create hidden iframe
            const iframe = document.createElement("iframe");
            iframe.name = targetName;
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

            // If the PayFort page can't even load (DNS/firewall), fail fast
            let didIframeLoad = false;
            const onIframeLoad = () => {
              didIframeLoad = true;
              if (loadGuardTimerRef.current) {
                window.clearTimeout(loadGuardTimerRef.current);
                loadGuardTimerRef.current = null;
              }
            };
            const onIframeError = () => {
              if (!resolved) {
                const msg =
                  "Unable to reach PayFort tokenization page (network/DNS blocked).";
                setError(msg);
                reject(new Error(msg));
                cleanup();
              }
            };
            iframe.addEventListener("load", onIframeLoad);
            iframe.addEventListener("error", onIframeError as any);
            loadGuardTimerRef.current = window.setTimeout(() => {
              if (!didIframeLoad && !resolved) {
                const msg =
                  "PayFort page did not load. This is usually a DNS/firewall issue.";
                setError(msg);
                reject(new Error(msg));
                cleanup();
              }
            }, 12000);
          } else {
            // Open popup path
            const popup = openCenteredPopup("payfortTokenPopup");
            if (!popup) {
              const msg =
                "Popup was blocked. Please allow popups for this site and try again.";
              setError(msg);
              reject(new Error(msg));
              cleanup();
              return;
            }
            popupRef.current = popup;
            targetName = "payfortTokenPopup";
          }

          // create form
          const form = document.createElement("form");
          form.method = "POST";
          form.action =
            (payfortConfig as any).payfort_url ||
            "https://sbcheckout.payfort.com/FortAPI/paymentPage";
          form.target = targetName;

          const shouldLogPayfortPayload =
            import.meta.env.DEV || (payfortConfig as any).debug;
          if (shouldLogPayfortPayload) {
            const logPayload = redactForLog(fields);
            // Redacted: full PAN, CVV, signature hash — safe for local debugging.
            console.log("[PayFort] Outbound tokenization (POST paymentPage)", {
              url: form.action,
              target: form.target,
              payload: logPayload,
            });
            if ((payfortConfig as any).debug) {
              try {
                localStorage.setItem(
                  "payfort_last_tokenization_request",
                  JSON.stringify(
                    {
                      at: new Date().toISOString(),
                      url: form.action,
                      target: form.target,
                      payload: logPayload,
                    },
                    null,
                    2
                  )
                );
              } catch (_) {}
            }
          }

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
              const data = e.data;
              if (!data) return;

              // Support both shapes:
              // - legacy: payload is directly the response object
              // - new: { source: "payfort-token", payload: {...} }
              const payload =
                data && typeof data === "object" && "payload" in data
                  ? (data as any).payload
                  : data;

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
          removeFormTimerRef.current = window.setTimeout(() => {
            try {
              form.remove();
            } catch (_) {}
          }, 1500);

          // timeout safety: if no response after 60 seconds
          timeoutTimerRef.current = window.setTimeout(() => {
            if (!resolved) {
              const msg =
                "Tokenization timed out. Please check your internet connection and try again.";
              setError(msg);
              if (
                import.meta.env.DEV ||
                (payfortConfig as any).debug
              ) {
                console.warn("[PayFort] Tokenization timed out", {
                  url: form.action,
                  expectedMerchantReference,
                });
              }
              reject(new Error(msg));
              cleanup();
            }
          }, 60000);
        } catch (err) {
          setIsLoading(false);
          setError((err as Error).message || String(err));
          reject(err);
          cleanup();
        }
      });

      // One retry for transient slowness.
      try {
        return await runOnce();
      } catch (err: any) {
        const msg = String(err?.message || "");
        if (msg.toLowerCase().includes("timed out")) {
          return await runOnce();
        }
        throw err;
      }
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
