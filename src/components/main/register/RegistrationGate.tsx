"use client";

import { useRegistrationOpen } from "./useRegistrationOpen";

export function RegistrationGate({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
}) {
  const open = useRegistrationOpen();
  return open ? children : fallback;
}
