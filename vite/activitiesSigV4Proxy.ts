import type {
  IncomingMessage,
  OutgoingHttpHeaders,
  ServerResponse,
} from "node:http";
import fs from "node:fs/promises";
import https from "node:https";
import path from "node:path";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
import type { Connect, Plugin } from "vite";
import { loadEnv } from "vite";
import aws4 from "aws4";
import { mergeActivitiesProxyProcessEnv } from "./mergeActivitiesProxyEnv";

const PROXY_PREFIX = "/api/activities-proxy";

const NO_CREDENTIALS_MESSAGE =
  "Sightseeing activities proxy: add credentials, then restart `npm run dev`. " +
  "Either set VITE_ACTIVITIES_API_KEY in `.env.local` (if your API stage accepts API-key auth), " +
  "or set IAM keys: AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY (or VITE_ACTIVITIES_AWS_*), " +
  "or ACTIVITIES_PROXY_CREDENTIALS_FILE (JSON), or AWS CLI profile / `aws sso login`. " +
  "Note: `destinationByOurCountry` is mocked automatically in dev when credentials are missing " +
  "(see VITE_ACTIVITIES_DISABLE_DEV_MOCK).";

type SigningCreds = {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
};

let credCache: { creds: SigningCreds; refreshAfterMs: number } | null = null;

let lastChainError: string | undefined;

function credentialsFileResolvedPath(): string | null {
  const raw = process.env.ACTIVITIES_PROXY_CREDENTIALS_FILE?.trim();
  if (!raw) return null;
  const cwd = process.cwd();
  const abs = path.resolve(cwd, raw);
  const rel = path.relative(path.resolve(cwd), abs);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    return null;
  }
  return abs;
}

async function readCredentialsFromFile(): Promise<SigningCreds | null> {
  const abs = credentialsFileResolvedPath();
  if (!abs) return null;
  try {
    const text = await fs.readFile(abs, "utf8");
    const data = JSON.parse(text) as Record<string, unknown>;
    const accessKeyId =
      typeof data.accessKeyId === "string" ? data.accessKeyId.trim() : "";
    const secretAccessKey =
      typeof data.secretAccessKey === "string"
        ? data.secretAccessKey.trim()
        : "";
    if (!(accessKeyId && secretAccessKey)) return null;
    const sessionToken =
      typeof data.sessionToken === "string"
        ? data.sessionToken.trim()
        : undefined;
    return {
      accessKeyId,
      secretAccessKey,
      sessionToken: sessionToken || undefined,
    };
  } catch (e) {
    console.error(
      "[activities-sigv4-proxy] ACTIVITIES_PROXY_CREDENTIALS_FILE read failed:",
      e,
    );
    return null;
  }
}

function credentialDiagnostics() {
  const filePath = credentialsFileResolvedPath();
  return {
    hasEnvAccessKeyId: Boolean(process.env.AWS_ACCESS_KEY_ID?.trim()),
    hasEnvSecretAccessKey: Boolean(process.env.AWS_SECRET_ACCESS_KEY?.trim()),
    awsProfile: process.env.AWS_PROFILE?.trim() || null,
    hasViteActivitiesApiKey: Boolean(
      process.env.VITE_ACTIVITIES_API_KEY?.trim(),
    ),
    credentialsFileEnvSet: Boolean(
      process.env.ACTIVITIES_PROXY_CREDENTIALS_FILE?.trim(),
    ),
    credentialsFileResolved: filePath,
    providerChainError: lastChainError ?? null,
  };
}

let loggedApiKeyOnlyFallback = false;
let loggedDevDestinationMock = false;

function devDestinationMockDisabled(): boolean {
  const v =
    process.env.VITE_ACTIVITIES_DISABLE_DEV_MOCK?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

function isDestinationByOurCountryPath(url: string): boolean {
  try {
    const u = new URL(url, "http://localhost");
    const p = u.pathname;
    return (
      p === `${PROXY_PREFIX}/destinationByOurCountry` ||
      p.endsWith("/destinationByOurCountry")
    );
  } catch {
    return false;
  }
}

function countryIsoFromDestinationUrl(url: string): string {
  try {
    return (new URL(url, "http://localhost").searchParams.get("country") || "")
      .trim()
      .toUpperCase();
  } catch {
    return "";
  }
}

/** Stub list so local city dropdown works without AWS (dev only). */
function mockDestinationsPayload(countryIso2: string): unknown {
  const c = countryIso2 || "XX";
  const byCountry: Record<string, { code: string; name: string }[]> = {
    AF: [
      { code: "KBL", name: "Kabul" },
      { code: "HEA", name: "Herat" },
      { code: "MZR", name: "Mazar-i-Sharif" },
    ],
    PK: [
      { code: "LHE", name: "Lahore" },
      { code: "ISB", name: "Islamabad" },
      { code: "KHI", name: "Karachi" },
    ],
    AE: [
      { code: "DXB", name: "Dubai" },
      { code: "AUH", name: "Abu Dhabi" },
    ],
    TR: [
      { code: "IST", name: "Istanbul" },
      { code: "AYT", name: "Antalya" },
    ],
  };
  return (
    byCountry[c] ?? [
      { code: `${c}01`, name: `Sample destination — ${c}` },
      { code: `${c}02`, name: `Demo city — ${c}` },
    ]
  );
}

function sendJsonWithCors(
  req: IncomingMessage,
  res: ServerResponse,
  status: number,
  payload: unknown,
  extraHeaders?: Record<string, string>,
) {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  if (extraHeaders) {
    for (const [k, v] of Object.entries(extraHeaders)) {
      res.setHeader(k, v);
    }
  }
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function headerOne(req: IncomingMessage, lcName: string): string | undefined {
  const v = req.headers[lcName];
  if (typeof v === "string" && v.trim() !== "") return v.trim();
  if (Array.isArray(v) && v[0]?.trim()) return v[0].trim();
  return undefined;
}

function activitiesApiKeyFromRequestOrEnv(
  req: IncomingMessage,
): string | undefined {
  return (
    headerOne(req, "x-api-key") ||
    process.env.VITE_ACTIVITIES_API_KEY?.trim() ||
    undefined
  );
}

function acceptHeader(req: IncomingMessage): string {
  const a = req.headers.accept;
  if (typeof a === "string" && a.trim() !== "") return a.trim();
  if (Array.isArray(a) && a[0]?.trim()) return a[0].trim();
  return "application/json";
}

function pipeExecuteApiToClient(
  proxyRes: IncomingMessage,
  res: ServerResponse,
  req: IncomingMessage,
  resolve: () => void,
) {
  res.statusCode = proxyRes.statusCode || 502;
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  for (const [key, value] of Object.entries(proxyRes.headers)) {
    if (value == null) continue;
    const lower = key.toLowerCase();
    if (lower === "access-control-allow-origin") continue;
    if (
      lower === "connection" ||
      lower === "transfer-encoding" ||
      lower === "keep-alive"
    ) {
      continue;
    }
    res.setHeader(key, value);
  }
  proxyRes.pipe(res);
  proxyRes.on("end", resolve);
}

async function getSigningCredentials(region: string): Promise<SigningCreds | null> {
  const now = Date.now();
  if (credCache && now < credCache.refreshAfterMs) {
    return credCache.creds;
  }

  const envId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const envSecret = process.env.AWS_SECRET_ACCESS_KEY?.trim();
  if (envId && envSecret) {
    const creds: SigningCreds = {
      accessKeyId: envId,
      secretAccessKey: envSecret,
      sessionToken: process.env.AWS_SESSION_TOKEN?.trim() || undefined,
    };
    credCache = { creds, refreshAfterMs: now + 120_000 };
    return creds;
  }

  const fileCreds = await readCredentialsFromFile();
  if (fileCreds) {
    credCache = { creds: fileCreds, refreshAfterMs: now + 120_000 };
    return fileCreds;
  }

  lastChainError = undefined;
  try {
    const credsOut = await fromNodeProviderChain({
      clientConfig: { region },
    })();
    if (!credsOut.accessKeyId || !credsOut.secretAccessKey) {
      return null;
    }
    const creds: SigningCreds = {
      accessKeyId: credsOut.accessKeyId,
      secretAccessKey: credsOut.secretAccessKey,
      sessionToken: credsOut.sessionToken,
    };
    const refreshAfterMs = credsOut.expiration
      ? Math.max(now + 30_000, credsOut.expiration.getTime() - 120_000)
      : now + 180_000;
    credCache = { creds, refreshAfterMs };
    return creds;
  } catch (e) {
    lastChainError = e instanceof Error ? e.message : String(e);
    console.error(
      "[activities-sigv4-proxy] fromNodeProviderChain failed:",
      lastChainError,
    );
    return null;
  }
}

export type ActivitiesProxyTarget = {
  host: string;
  stagePath: string;
  region: string;
};

export function parseActivitiesTargetFromEnv(base: string): ActivitiesProxyTarget {
  const fallback =
    "https://rd2dteyt9c.execute-api.eu-west-1.amazonaws.com/dev";
  const u = new URL((base || fallback).trim());
  const host = u.hostname;
  let stagePath = u.pathname.replace(/\/$/, "");
  if (!stagePath) stagePath = "/dev";
  const regionMatch = host.match(
    /\.execute-api\.([a-z0-9-]+)\.amazonaws\.com$/,
  );
  const region = regionMatch?.[1] ?? "eu-west-1";
  return { host, stagePath, region };
}

function readRequestBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c as Buffer));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function sendOptions(req: IncomingMessage, res: ServerResponse) {
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    req.headers["access-control-request-headers"] ||
      "Content-Type,Accept,Authorization",
  );
  res.setHeader("Access-Control-Max-Age", "86400");
  res.setHeader("Vary", "Origin");
  res.statusCode = 204;
  res.end();
}

function attachActivitiesProxy(
  middlewares: Connect.Server,
  target: ActivitiesProxyTarget,
) {
  middlewares.use(
    (req: IncomingMessage, res: ServerResponse, next: () => void) => {
      void (async () => {
        const url = req.url || "";
        if (!url.startsWith(PROXY_PREFIX)) {
          next();
          return;
        }

        if (req.method === "OPTIONS") {
          sendOptions(req, res);
          return;
        }

        const signingCreds = await getSigningCredentials(target.region);
        const apiKey = activitiesApiKeyFromRequestOrEnv(req);

        if (!signingCreds && !apiKey) {
          if (
            isDestinationByOurCountryPath(url) &&
            !devDestinationMockDisabled()
          ) {
            if (!loggedDevDestinationMock) {
              loggedDevDestinationMock = true;
              console.warn(
                "[activities-sigv4-proxy] No AWS credentials or API key — returning mock " +
                  "`destinationByOurCountry` data (dev only). Use real API: set keys in `.env.local` " +
                  "or VITE_ACTIVITIES_DISABLE_DEV_MOCK=true to see this error instead.",
              );
            }
            const cc = countryIsoFromDestinationUrl(url);
            sendJsonWithCors(req, res, 200, mockDestinationsPayload(cc), {
              "X-Activities-Proxy": "mock-destinationByOurCountry",
            });
            return;
          }

          res.statusCode = 502;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              message: NO_CREDENTIALS_MESSAGE,
              code: "ACTIVITIES_PROXY_NO_AWS_CREDENTIALS",
              diagnostics: credentialDiagnostics(),
            }),
          );
          return;
        }

        try {
          const body = await readRequestBody(req);
          const localUrl = new URL(url, "http://localhost");
          const suffix = localUrl.pathname.slice(PROXY_PREFIX.length);
          const targetPath =
            target.stagePath.replace(/\/$/, "") +
            (suffix.startsWith("/") ? suffix : `/${suffix}`) +
            localUrl.search;

          const contentType =
            req.headers["content-type"] || "application/json";
          const accept = acceptHeader(req);

          if (!signingCreds) {
            if (!loggedApiKeyOnlyFallback) {
              loggedApiKeyOnlyFallback = true;
              console.warn(
                "[activities-sigv4-proxy] No AWS IAM credentials; using x-api-key only. " +
                  "If AWS returns 403, add AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY (or credentials file / CLI).",
              );
            }
            await new Promise<void>((resolve, reject) => {
              const proxyReq = https.request(
                {
                  hostname: target.host,
                  path: targetPath,
                  method: req.method || "GET",
                  headers: {
                    "Content-Type": contentType,
                    Accept: accept,
                    "x-api-key": apiKey!,
                  },
                },
                (proxyRes) => {
                  pipeExecuteApiToClient(proxyRes, res, req, resolve);
                },
              );
              proxyReq.on("error", reject);
              if (body.length) proxyReq.write(body);
              proxyReq.end();
            });
            return;
          }

          const signOpts: aws4.Request = {
            host: target.host,
            path: targetPath,
            method: req.method || "GET",
            headers: {
              "Content-Type": contentType,
              Accept: accept,
            },
            service: "execute-api",
            region: target.region,
          };
          if (body.length) {
            signOpts.body = body.toString("utf8");
          }

          aws4.sign(signOpts, {
            accessKeyId: signingCreds.accessKeyId,
            secretAccessKey: signingCreds.secretAccessKey,
            sessionToken: signingCreds.sessionToken,
          });

          const apiKeyAfterSign = activitiesApiKeyFromRequestOrEnv(req);
          if (apiKeyAfterSign) {
            (signOpts.headers as Record<string, string>)["x-api-key"] =
              apiKeyAfterSign;
          }

          await new Promise<void>((resolve, reject) => {
            const proxyReq = https.request(
              {
                hostname: target.host,
                path: signOpts.path,
                method: signOpts.method,
                headers: signOpts.headers as OutgoingHttpHeaders,
              },
              (proxyRes) => {
                pipeExecuteApiToClient(proxyRes, res, req, resolve);
              },
            );
            proxyReq.on("error", reject);
            if (body.length) proxyReq.write(body);
            proxyReq.end();
          });
        } catch (e) {
          res.statusCode = 502;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: String(e) }));
        }
      })();
    },
  );
}

export function activitiesSigV4ProxyPlugin(
  target: ActivitiesProxyTarget,
): Plugin {
  return {
    name: "activities-sigv4-dev-proxy",
    enforce: "pre",
    configureServer(server) {
      mergeActivitiesProxyProcessEnv(
        loadEnv(server.config.mode, server.config.envDir, ""),
      );
      attachActivitiesProxy(server.middlewares, target);
    },
  };
}
