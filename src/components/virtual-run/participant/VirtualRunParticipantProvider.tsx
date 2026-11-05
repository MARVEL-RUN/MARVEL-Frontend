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
import { useRegistrationOptions } from "@/components/main/register/useRegistrationOptions";
import { VIRTUAL_RUN_EVENT_ID } from "@/lib/main/config";
import { clearLoginSession, readLoginSession } from "@/lib/virtual-run/login-session";
import { ownedRoundIdsForCategory } from "@/lib/virtual-run/owned-rounds";
import {
  clearParticipant,
  readParticipant,
  writeParticipant,
} from "@/lib/virtual-run/participant-client";
import { defaultParticipant, type VirtualRunParticipant } from "@/lib/virtual-run/participant";
import type { VirtualRunRoundId } from "@/lib/virtual-run/rounds";

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

function sameRoundIds(a: VirtualRunRoundId[], b: VirtualRunRoundId[]) {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

export function VirtualRunParticipantProvider({ children }: { children: ReactNode }) {
  const [participant, setParticipant] = useState<VirtualRunParticipant | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const options = useRegistrationOptions(VIRTUAL_RUN_EVENT_ID);

  const refresh = useCallback(() => {
    setParticipant(readLoginSession() ? readParticipant() : null);
  }, []);

  useEffect(() => {
    setParticipant(readLoginSession() ? readParticipant() : null);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !participant || options.loading || !options.categories.length) return;
    const session = readLoginSession();
    const eventCategoryId =
      session?.eventCategoryId?.trim() ||
      options.categories.find((item) => item.categoryName === participant.categoryName?.trim())
        ?.categoryId ||
      "";
    if (!eventCategoryId) return;
    const owned = ownedRoundIdsForCategory(options.categories, eventCategoryId);
    if (!owned.length || sameRoundIds(participant.ownedRoundIds, owned)) return;
    const next = { ...participant, ownedRoundIds: owned };
    writeParticipant(next);
    setParticipant(next);
  }, [hydrated, participant, options.loading, options.categories]);

  const login = useCallback((patch: Partial<VirtualRunParticipant>) => {
    const base = readParticipant() ?? defaultParticipant();
    const next = { ...base, ...patch };
    writeParticipant(next);
    setParticipant(next);
  }, []);

  const logout = useCallback(() => {
    clearLoginSession();
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
  };
}
