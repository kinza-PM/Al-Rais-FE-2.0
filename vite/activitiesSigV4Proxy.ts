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
let loggedDevListingMock = false;

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

function activitiesProxyPathSuffix(url: string): string {
  try {
    const p = new URL(url, "http://localhost").pathname;
    if (!p.startsWith(PROXY_PREFIX)) return "";
    return p.slice(PROXY_PREFIX.length) || "/";
  } catch {
    return "";
  }
}

function parseJsonBody(buf: Buffer): unknown {
  if (!buf.length) return {};
  try {
    return JSON.parse(buf.toString("utf8")) as unknown;
  } catch {
    return null;
  }
}

function destinationFromGetAvailabilityBody(data: unknown): string | null {
  const o =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : null;
  if (!o) return null;
  const filters = o.filters;
  if (!Array.isArray(filters)) return null;
  for (const f of filters) {
    if (!f || typeof f !== "object") continue;
    const items = (f as Record<string, unknown>).searchFilterItems;
    if (!Array.isArray(items)) continue;
    for (const it of items) {
      if (!it || typeof it !== "object") continue;
      const io = it as Record<string, unknown>;
      if (io.type === "destination" && typeof io.value === "string") {
        return io.value.trim().toUpperCase();
      }
    }
  }
  return null;
}

/** Figma-style titles for dev mock (`getAvailability` / detail), keyed by destination code. */
const MOCK_SIGHTSEEING_TITLES_BY_DEST: Record<string, readonly string[]> = {
  DXB: [
    "Dubai City Tour: Discover Iconic Landmarks",
    "Desert Safari & BBQ Dinner Under the Stars",
    "Dubai Marina Sunset Yacht Experience",
  ],
  AUH: [
    "Abu Dhabi Highlights: Mosque & Corniche Drive",
    "Heritage Village & Cultural Landmarks Tour",
    "Full-Day City Icons & Waterfront Views",
  ],
  KBL: [
    "Kabul Heritage Walk: Gardens & Historic Quarters",
    "Mountain Views & Traditional Lunch Excursion",
    "Cultural Highlights & Artisan Markets Tour",
  ],
  LHE: [
    "Lahore Fort & Old City Heritage Trail",
    "Food & Culture Evening Experience",
    "Walled City Architecture & Bazaars",
  ],
  ISB: [
    "Islamabad City Tour: Monuments & Viewpoints",
    "Margalla Hills Scenic Nature Walk",
    "Faisal Mosque & Museums Discovery Tour",
  ],
  KHI: [
    "Karachi Coastal Drive & Historic Districts",
    "City Icons & Local Flavors Half-Day Tour",
    "Clifton & Cultural Waterfront Experience",
  ],
  IST: [
    "Istanbul Old City: Icons Across Continents",
    "Bosphorus Cruise & Skyline Highlights",
    "Grand Bazaar & Hidden Gems Walking Tour",
  ],
  AYT: [
    "Antalya Coast & Ancient Harbor Tour",
    "Waterfalls & Old Town Scenic Day",
    "Mediterranean Views & Local Markets",
  ],
};

const MOCK_SIGHTSEEING_TITLES_DEFAULT: readonly string[] = [
  "City Highlights: Icons & Local Stories",
  "Half-Day Guided Sightseeing Adventure",
  "Scenic Landmarks & Cultural Discoveries Tour",
  "Sunset Views & Photo Stops",
  "Heritage Walk & Local Markets",
  "Food & Culture Trail",
  "Nature & Scenic Viewpoints",
  "Architecture & History Tour",
];

function pickMockSightseeingTitle(dest: string, index: number): string {
  const d = dest.trim().toUpperCase();
  const pool = MOCK_SIGHTSEEING_TITLES_BY_DEST[d] ?? MOCK_SIGHTSEEING_TITLES_DEFAULT;
  const base = pool[index % pool.length] ?? pool[0];
  const cycle = Math.floor(index / pool.length);
  return cycle === 0 ? base : `${base} — option ${cycle + 1}`;
}

function mockListingHeroImage(dest: string, i: number): string {
  const d = dest.trim().toUpperCase();
  const seed = `ar-${d}-${i}`.replace(/[^a-zA-Z0-9-]/g, "");
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/900/600`;
}

/** Uses the same `pagination` shape the client sends on `getAvailability`. */
function paginationFromGetAvailabilityBody(data: unknown): {
  itemsPerPage: number;
  page: number;
} {
  const o =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : null;
  const p = o?.pagination;
  const po =
    p && typeof p === "object" && !Array.isArray(p)
      ? (p as Record<string, unknown>)
      : null;
  let itemsPerPage = 100;
  let page = 1;
  if (po) {
    const ipp = Number(po.itemsPerPage ?? po.pageSize ?? po.perPage);
    if (Number.isFinite(ipp) && ipp > 0) {
      itemsPerPage = Math.min(100, Math.max(1, Math.floor(ipp)));
    }
    const pg = Number(po.page);
    if (Number.isFinite(pg) && pg >= 1) page = Math.floor(pg);
  }
  return { itemsPerPage, page };
}

function mockTitleFromActivityCode(code: string): string {
  const m = /^([A-Z]{2,})-MOCK-(\d+)$/i.exec(code.trim());
  if (m) {
    return pickMockSightseeingTitle(m[1], parseInt(m[2], 10) - 1);
  }
  return `Discover & Explore: ${code.trim()}`;
}

function mockListingRow(
  dest: string,
  i: number,
): Record<string, unknown> {
  const code = `${dest}-MOCK-${i + 1}`;
  const title = pickMockSightseeingTitle(dest, i);
  const hours = [5, 6, 8, 7, 9, 4][i % 6];
  const hero = mockListingHeroImage(dest, i);
  return {
    activityCode: code,
    code,
    name: title,
    image: hero,
    category: "Sightseeing Tour",
    rating: Math.min(5, Math.round((4.1 + (i % 10) * 0.07) * 10) / 10),
    reviewCount: 32 + i * 17,
    country: { destinations: [{ name: dest }] },
    modalities: [
      {
        name: i % 2 === 0 ? "Shared group" : "Private group",
        duration: hours / 24,
        rates: [
          {
            rateDetails: [
              {
                totalAmount: { amount: 45 + i * 11, currency: "USD" },
              },
            ],
          },
        ],
      },
    ],
    content: {
      name: title,
      image: hero,
      media: [{ type: "IMAGE", url: hero }],
    },
  };
}

function mockGetAvailabilityResponse(dest: string, parsed: unknown): unknown {
  const d = dest.trim().toUpperCase() || "MOCK";
  const { itemsPerPage, page } = paginationFromGetAvailabilityBody(parsed);

  if (page > 1) {
    return {
      activities: [],
      pagination: {
        page,
        totalPages: 1,
        total: itemsPerPage,
        itemsPerPage: 0,
      },
    };
  }

  const activities = Array.from({ length: itemsPerPage }, (_, i) =>
    mockListingRow(d, i),
  );
  return {
    activities,
    pagination: {
      page: 1,
      totalPages: 1,
      total: activities.length,
      itemsPerPage: activities.length,
    },
  };
}

function detailFieldsFromBody(data: unknown): {
  code: string;
  from: string;
  to: string;
} | null {
  const o =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : null;
  if (!o) return null;
  const codeRaw =
    (typeof o.code === "string" ? o.code : null) ??
    (typeof o.activityCode === "string" ? o.activityCode : null) ??
    "";
  const code = String(codeRaw).trim();
  if (!code) return null;
  const from = typeof o.from === "string" ? o.from : "2026-01-01";
  const to = typeof o.to === "string" ? o.to : "2026-01-02";
  return { code, from, to };
}

function mockActivitiesDetailResponse(
  code: string,
  from: string,
  to: string,
): unknown {
  const safeFrom = from || "2026-01-01";
  const safeTo = to || "2026-01-02";
  const keyTail = code.replace(/[^a-zA-Z0-9]/g, "").slice(0, 24) || "KEY";
  const m = /^([A-Z]{2,})-MOCK-(\d+)$/i.exec(code.trim());
  const dest = m ? m[1] : "MOCK";
  const idx = m ? parseInt(m[2], 10) - 1 : 0;
  const rating = Math.min(
    5,
    Math.round((4.1 + (idx % 10) * 0.07) * 10) / 10,
  );
  const reviewCount = 3500 + idx * 41;
  const media = Array.from({ length: 10 }, (_, j) => ({
    type: "IMAGE",
    url: `https://picsum.photos/seed/${encodeURIComponent(
      `ar-detail-${dest}-${idx}-g-${j}`,
    )}/900/600`,
  }));
  const title = mockTitleFromActivityCode(code);
  return {
    activity: {
      code,
      name: title,
      type: "TICKET",
      currency: "USD",
      rating,
      reviewCount,
      content: {
        name: title,
        description:
          "Experience golden-hour dunes, professional drivers, camel moments, and a BBQ dinner under the stars. Hotel pickup and drop-off included.",
        media,
      },
      modalities: [
        {
          code: "STD",
          name: "Standard",
          destinationCode: "MOCK",
          duration: 6 / 24,
          rates: [
            {
              rateCode: "GENERIC",
              rateDetails: [
                {
                  rateKey: `MOCK-RATE-${keyTail}`,
                  operationDates: [
                    {
                      from: safeFrom,
                      to: safeTo,
                      cancellationPolicies: [
                        {
                          amount: 0,
                          description: "Free cancellation up to 24h before",
                        },
                      ],
                    },
                  ],
                  sessions: [{ code: "MORNING", name: "Morning session" }],
                  languages: [{ code: "en", name: "English" }],
                  totalAmount: { amount: 89, currency: "USD" },
                },
              ],
            },
          ],
        },
      ],
    },
  };
}

function isMockBookingPathSuffix(suffix: string): boolean {
  return (
    suffix.startsWith("/preConfirmBooking") ||
    suffix.startsWith("/confirmBooking") ||
    suffix.startsWith("/cancelBooking")
  );
}

function bookingReferenceFromParsed(parsed: unknown): string {
  const o =
    parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  if (!o) return `MOCK-${Date.now()}`;
  const r = o.reference ?? o.bookingReference;
  if (typeof r === "string" && r.trim()) return r.trim();
  return `MOCK-${Date.now()}`;
}

function mockBookingResponse(url: string, parsed: unknown): unknown {
  const ref = bookingReferenceFromParsed(parsed);
  if (url.includes("cancelBooking")) {
    return {
      operationId: "mock-cancel",
      booking: { reference: ref, status: "CANCELLED" },
    };
  }
  if (url.includes("preConfirmBooking")) {
    return {
      operationId: "mock-preconfirm",
      booking: { reference: `PRE-${ref}`, status: "PRECONFIRMED" },
    };
  }
  return {
    operationId: "mock-confirm",
    booking: { reference: `CFM-${ref}`, status: "CONFIRMED" },
  };
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
    "https://vfp63x1v88.execute-api.eu-west-1.amazonaws.com/qa";
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
          if (devDestinationMockDisabled()) {
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

          if (isDestinationByOurCountryPath(url)) {
            if (!loggedDevDestinationMock) {
              loggedDevDestinationMock = true;
              console.warn(
                "[activities-sigv4-proxy] No AWS credentials or API key — dev mocks enabled " +
                  "for activities (`destinationByOurCountry`, `getAvailability`, `activitiesDetail`, booking). " +
                  "Set keys in `.env.local` or VITE_ACTIVITIES_DISABLE_DEV_MOCK=true to disable.",
              );
            }
            const cc = countryIsoFromDestinationUrl(url);
            sendJsonWithCors(req, res, 200, mockDestinationsPayload(cc), {
              "X-Activities-Proxy": "mock-destinationByOurCountry",
            });
            return;
          }

          const suffix = activitiesProxyPathSuffix(url);
          const bodyBufEarly = await readRequestBody(req);
          const parsedEarly = parseJsonBody(bodyBufEarly);

          if (suffix.startsWith("/getAvailability") && req.method === "POST") {
            const dest = destinationFromGetAvailabilityBody(parsedEarly);
            if (dest) {
              if (!loggedDevListingMock) {
                loggedDevListingMock = true;
                console.warn(
                  "[activities-sigv4-proxy] Mock `getAvailability` (dev only).",
                );
              }
              sendJsonWithCors(
                req,
                res,
                200,
                mockGetAvailabilityResponse(dest, parsedEarly),
                {
                  "X-Activities-Proxy": "mock-getAvailability",
                },
              );
              return;
            }
          }

          if (suffix.startsWith("/activitiesDetail") && req.method === "POST") {
            const fields = detailFieldsFromBody(parsedEarly);
            if (fields) {
              sendJsonWithCors(
                req,
                res,
                200,
                mockActivitiesDetailResponse(
                  fields.code,
                  fields.from,
                  fields.to,
                ),
                { "X-Activities-Proxy": "mock-activitiesDetail" },
              );
              return;
            }
          }

          if (suffix.startsWith("/myActivityBooking") && req.method === "POST") {
            sendJsonWithCors(
              req,
              res,
              200,
              { data: { items: [] } },
              { "X-Activities-Proxy": "mock-myActivityBooking" },
            );
            return;
          }

          if (
            isMockBookingPathSuffix(suffix) &&
            req.method === "POST"
          ) {
            sendJsonWithCors(req, res, 200, mockBookingResponse(url, parsedEarly), {
              "X-Activities-Proxy": "mock-booking",
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
