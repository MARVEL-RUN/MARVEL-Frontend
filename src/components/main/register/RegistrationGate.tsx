"use client";

import { useRegistrationOpen } from "./useRegistrationOpen";
import { useRegistrationRound2Pause } from "./useRegistrationRound2Pause";

export function RegistrationGate({
  children,
  fallback,
  round2Fallback,
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
  round2Fallback?: React.ReactNode;
}) {
  const open = useRegistrationOpen();
  const round2Pause = useRegistrationRound2Pause();
  if (!open) return fallback;
  if (round2Pause) return round2Fallback ?? fallback;
  return children;
}
