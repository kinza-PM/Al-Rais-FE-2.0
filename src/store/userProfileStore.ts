import { create } from "zustand";
import * as RemoteUserService from "../services/api/remoteUserService";
import type { RemoteUserRecord } from "../services/api/remoteUserService";

interface UserProfileState {
  remoteUser: RemoteUserRecord | null;
  avatarUrl: string | null;
  initials: string;
  displayName: string;
  loading: boolean;
  fetched: boolean; // guard — sirf ek baar fetch ho

  fetchProfile: (user: {
    id: string;
    email?: string;
    phone?: string;
    name?: string;
    full_name?: string;
  }) => Promise<void>;
  setRemoteUser: (u: RemoteUserRecord) => void;
  setAvatarUrl: (url: string | null) => void;
  reset: () => void;
}

function computeInitials(name?: string | null, email?: string | null): string {
  const raw = (name || email || "").trim();
  if (!raw) return "U";
  const words = raw
    .replace(/@.*/, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return raw.slice(0, 2).toUpperCase();
}

export const useUserProfileStore = create<UserProfileState>((set, get) => ({
  remoteUser: null,
  avatarUrl: null,
  initials: "U",
  displayName: "User",
  loading: false,
  fetched: false,

  fetchProfile: async (user) => {
    // Agar already fetch ho chuka hai tou dobara mat karo
    if (get().fetched || get().loading) return;

    set({ loading: true });
    try {
      const email = (user.email || "").trim().toLowerCase();
      const phoneNumber = (user.phone || "").trim();

      let record =
        email || phoneNumber
          ? await RemoteUserService.getByIdentifier({
              email: email || undefined,
              phoneNumber: phoneNumber || undefined,
            })
          : null;

      if (!record) {
        record = await RemoteUserService.createUser({
          userId: user.id,
          email: email || undefined,
          phoneNumber: phoneNumber || undefined,
          name: user.full_name || user.name || undefined,
          signupMethod: phoneNumber?.startsWith("+") ? "PHONE" : "EMAIL",
        });
      }

      let avatarUrl: string | null = null;
      try {
        const av = await RemoteUserService.getAvatarViewUrl(
          record.userId,
          record.createdAt,
        );
        avatarUrl = av.url ?? null;
      } catch {
        avatarUrl = null;
      }

      const displayName =
        record.name ||
        user.full_name ||
        user.name ||
        record.email ||
        user.email ||
        "User";

      set({
        remoteUser: record,
        avatarUrl,
        initials: computeInitials(
          record.name || user.full_name || user.name,
          record.email || user.email,
        ),
        displayName,
        loading: false,
        fetched: true,
      });
    } catch {
      set({ loading: false, fetched: true });
    }
  },

  setRemoteUser: (u) =>
    set((s) => ({
      remoteUser: u,
      initials: computeInitials(u.name, u.email),
      displayName: u.name || u.email || s.displayName,
    })),

  setAvatarUrl: (url) => set({ avatarUrl: url }),

  reset: () =>
    set({
      remoteUser: null,
      avatarUrl: null,
      initials: "U",
      displayName: "User",
      loading: false,
      fetched: false,
    }),
}));
