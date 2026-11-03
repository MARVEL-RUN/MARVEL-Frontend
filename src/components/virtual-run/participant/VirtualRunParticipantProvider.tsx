"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearParticipant,
  ensureDemoParticipant,
  readParticipant,
  writeParticipant,
} from "@/lib/virtual-run/participant-client";
import { defaultParticipant, type VirtualRunParticipant } from "@/lib/virtual-run/participant";
import { virtualRunDemoEnabled } from "@/lib/virtual-run/site";

type Ctx = {
  participant: VirtualRunParticipant | null;
  isLoggedIn: boolean;
  ready: boolean;
  login: (patch: Partial<VirtualRunParticipant>) => void;
  logout: () => void;
  update: (next: VirtualRunParticipant) => void;
  refresh: () => void;
};

const VirtualRunParticipantContext = createContext<Ctx | null>(null);

export function VirtualRunParticipantProvider({ children }: { children: ReactNode }) {
  const [participant, setParticipant] = useState<VirtualRunParticipant | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => {
    setParticipant(readParticipant());
  }, []);

  useEffect(() => {
    let p = readParticipant();
    if (!p && virtualRunDemoEnabled) {
      p = ensureDemoParticipant();
    }
    setParticipant(p);
    setHydrated(true);
  }, []);

  const login = useCallback((patch: Partial<VirtualRunParticipant>) => {
    const base = readParticipant() ?? defaultParticipant();
    const next = { ...base, ...patch };
    writeParticipant(next);
    setParticipant(next);
  }, []);

  const logout = useCallback(() => {
    clearParticipant();
    setParticipant(null);
  }, []);

  const update = useCallback((next: VirtualRunParticipant) => {
    writeParticipant(next);
    setParticipant(next);
  }, []);

  const value = useMemo(
    () => ({
      participant: hydrated ? participant : null,
      isLoggedIn: Boolean(participant),
      ready: hydrated,
      login,
      logout,
      update,
      refresh,
    }),
    [hydrated, participant, login, logout, update, refresh],
  );

  return (
    <VirtualRunParticipantContext.Provider value={value}>
      {children}
    </VirtualRunParticipantContext.Provider>
  );
}

export function useVirtualRunParticipant(): Ctx {
  const ctx = useContext(VirtualRunParticipantContext);
  if (!ctx) {
    throw new Error("useVirtualRunParticipant must be used within VirtualRunParticipantProvider");
  }
  return ctx;
}

/** SSR·하이드레이션 전에는 localStorage 없이 기본값만 */
export function useVirtualRunParticipantOrDemo(): Ctx & {
  participant: VirtualRunParticipant;
} {
  const ctx = useVirtualRunParticipant();
  return {
    ...ctx,
    participant: ctx.participant ?? defaultParticipant(),
    isLoggedIn: ctx.isLoggedIn || virtualRunDemoEnabled,
  };
}
