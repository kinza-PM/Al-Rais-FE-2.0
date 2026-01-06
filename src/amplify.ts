import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports";
import appsyncConfig from "./config/appsync";

let configured = false;

export function configureAmplify() {
  if (configured) return;

  // Prefer values from aws-exports, but allow env-based overrides without dropping required fields (like apiKey).
  const baseApi = ((awsconfig as any).API ?? {}) as any;
  const baseGraphQL = (baseApi.GraphQL ?? {}) as any;
  const overrideApi = (appsyncConfig ?? undefined) as any;
  const overrideGraphQL = (overrideApi?.GraphQL ?? {}) as any;

  const mergedGraphQL = {
    ...baseGraphQL,
    ...overrideGraphQL,
  } as any;

  // Never let an env override wipe out an existing API key.
  if (typeof overrideGraphQL.apiKey === "undefined" && baseGraphQL.apiKey) {
    mergedGraphQL.apiKey = baseGraphQL.apiKey;
  }

  // If the base config has an API key (API_KEY auth) but env override switches to IAM without providing an API key,
  // keep the base defaultAuthMode to avoid "NoApiKey" at runtime.
  if (
    baseGraphQL.apiKey &&
    overrideGraphQL.defaultAuthMode === "iam" &&
    !overrideGraphQL.apiKey
  ) {
    mergedGraphQL.defaultAuthMode = baseGraphQL.defaultAuthMode ?? "apiKey";
  }

  const mergedConfig = {
    ...awsconfig,
    ...(overrideApi
      ? {
          API: {
            ...baseApi,
            ...overrideApi,
            GraphQL: mergedGraphQL,
          },
        }
      : {}),
  };

  Amplify.configure(mergedConfig);

  // Helpful runtime diagnostics (dev only) for AppSync auth issues like NoApiKey/NoCredentials.
  if (import.meta.env.DEV) {
    const effective = (mergedConfig as any)?.API?.GraphQL ?? {};
    const effectiveApiKey = effective.apiKey as string | undefined;
    console.info("[Amplify] AppSync GraphQL configured:", {
      endpoint: effective.endpoint,
      region: effective.region,
      defaultAuthMode: effective.defaultAuthMode,
      hasApiKey: Boolean(effectiveApiKey),
      apiKeyHint: effectiveApiKey
        ? `${effectiveApiKey.slice(0, 4)}...${effectiveApiKey.slice(-4)}`
        : undefined,
    });
  }

  configured = true;
}

// Configure immediately on import so other modules (services) can safely use Amplify.
configureAmplify();

