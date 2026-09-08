import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AdminUser } from "@/types/admin";

type Tokens = {
  accessToken: string;
  refreshToken?: string;
};

type AdminAuthState = {
  isLoggedIn: boolean;
  user: AdminUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  hasHydrated: boolean;
  login: (tokens: Tokens, user: AdminUser) => void;
  logout: () => void;
  updateUser: (user: AdminUser) => void;
};

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      hasHydrated: false,

      login: (tokens, user) =>
        set({
          isLoggedIn: true,
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken ?? null,
        }),

      logout: () =>
        set({
          isLoggedIn: false,
          user: null,
          accessToken: null,
          refreshToken: null,
        }),

      updateUser: (user) => set({ user }),
    }),
    {
      name: "mr-admin-auth-storage",
      storage: createJSONStorage(() =>
        typeof window === "undefined"
          ? {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
          : localStorage,
      ),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      skipHydration: true,
    },
  ),
);
