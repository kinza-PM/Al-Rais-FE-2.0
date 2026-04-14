import { fetchAuthSession } from "aws-amplify/auth";

export type RemoteUserRecord = {
  userId: string;
  createdAt: string;
  updatedAt?: string;
  name?: string | null;
  email?: string;
  phoneNumber?: string;
  status?: string;
  signupMethod?: "EMAIL" | "PHONE";
  allowNotifications?: boolean;
  avatarKey?: string;
  avatarUpdatedAt?: string;
};

const BASE_URL =
  (import.meta.env.VITE_USER_SVC_BASE_URL as string | undefined)?.trim() ||
  "https://yjz5d5q2i0.execute-api.eu-west-1.amazonaws.com";

async function getIdToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() ?? null;
  } catch {
    return null;
  }
}

async function requestJson<T>(
  path: string,
  init?: RequestInit,
  opts?: { auth?: boolean }
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as any),
  };

  if (opts?.auth) {
    const token = await getIdToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...init, headers });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (json as any)?.message || (json as any)?.error || "Request failed";
    throw new Error(String(msg));
  }
  return json as T;
}

export async function getByIdentifier(input: {
  email?: string;
  phoneNumber?: string;
}): Promise<RemoteUserRecord | null> {
  const qs = new URLSearchParams();
  if (input.email) qs.set("email", input.email);
  if (input.phoneNumber) qs.set("phoneNumber", input.phoneNumber);
  try {
    return await requestJson<RemoteUserRecord>(`/users/by-identifier?${qs.toString()}`);
  } catch (e: any) {
    if (String(e?.message || "").toLowerCase().includes("not found")) return null;
    return null;
  }
}

export async function createUser(input: {
  userId: string;
  email?: string;
  phoneNumber?: string;
  name?: string;
  signupMethod?: "EMAIL" | "PHONE";
}): Promise<RemoteUserRecord> {
  return await requestJson<RemoteUserRecord>(`/users`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateUser(
  userId: string,
  createdAt: string,
  patch: Partial<Pick<RemoteUserRecord, "name" | "email" | "phoneNumber" | "allowNotifications" | "avatarKey">>
): Promise<RemoteUserRecord> {
  return await requestJson<RemoteUserRecord>(`/users/${encodeURIComponent(userId)}/${encodeURIComponent(createdAt)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function presignAvatarUpload(userId: string, createdAt: string, input: { contentType: string; fileName?: string }) {
  return await requestJson<{ uploadUrl: string; key: string; expiresIn: number }>(
    `/users/${encodeURIComponent(userId)}/${encodeURIComponent(createdAt)}/avatar/presign`,
    { method: "POST", body: JSON.stringify(input) }
  );
}

export async function getAvatarViewUrl(userId: string, createdAt: string) {
  return await requestJson<{ url: string | null; key: string | null; expiresIn?: number }>(
    `/users/${encodeURIComponent(userId)}/${encodeURIComponent(createdAt)}/avatar/url`,
    { method: "GET" }
  );
}

