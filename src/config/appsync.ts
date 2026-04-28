const endpoint = import.meta.env.VITE_APPSYNC_URL;
const apiKey =
  import.meta.env.VITE_APPSYNC_API_KEY ||
  import.meta.env.VITE_APPSYNC_APIKEY || // common alt
  import.meta.env.VITE_APPSYNC_KEY; // fallback
const region =
  import.meta.env.VITE_APPSYNC_REGION || import.meta.env.VITE_AWS_REGION;

/**
 * Lightweight AppSync config consumed by Amplify.
 * We keep secrets out of the repo via Vite env vars.
 */
const appsyncConfig =
  endpoint && (apiKey || import.meta.env.VITE_APPSYNC_AUTH_MODE === "iam")
    ? {
        GraphQL: {
          endpoint,
          region: region || "eu-west-1",
          defaultAuthMode:
            import.meta.env.VITE_APPSYNC_AUTH_MODE === "iam"
              ? "iam"
              : "apiKey",
          apiKey: apiKey,
          additionalAuthModes: ["iam"],
        },
      }
    : undefined;

export default appsyncConfig;
