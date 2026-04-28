/**
 * Mirrors env merging from `vite.config.ts` so the activities proxy middleware
 * sees the same `.env` / `.env.local` values as Vite (uses `server.config.envDir`).
 */
export function mergeActivitiesProxyProcessEnv(
  env: Record<string, string>,
): void {
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined && value !== "") {
      process.env[key] = value;
    }
  }

  const proxyCredKeys = [
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_SESSION_TOKEN",
    "AWS_PROFILE",
  ] as const;
  for (const key of proxyCredKeys) {
    const v = env[key];
    if (v && (!process.env[key] || process.env[key] === "")) {
      process.env[key] = v;
    }
  }

  const activitiesAwsFromVite = [
    ["VITE_ACTIVITIES_AWS_ACCESS_KEY_ID", "AWS_ACCESS_KEY_ID"],
    ["VITE_ACTIVITIES_AWS_SECRET_ACCESS_KEY", "AWS_SECRET_ACCESS_KEY"],
    ["VITE_ACTIVITIES_AWS_SESSION_TOKEN", "AWS_SESSION_TOKEN"],
    ["VITE_ACTIVITIES_AWS_PROFILE", "AWS_PROFILE"],
  ] as const;
  for (const [from, to] of activitiesAwsFromVite) {
    const v = env[from];
    if (v && (!process.env[to] || process.env[to] === "")) {
      process.env[to] = v;
    }
  }

  if (
    !process.env.AWS_SDK_LOAD_CONFIG ||
    process.env.AWS_SDK_LOAD_CONFIG === ""
  ) {
    process.env.AWS_SDK_LOAD_CONFIG = "1";
  }
}
