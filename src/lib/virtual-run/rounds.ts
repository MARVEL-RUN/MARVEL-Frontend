export type VirtualRunRoundId = "avengers" | "x-men" | "fantastic-four";

export type VirtualRunRoundCertStatus =
  | "locked"
  | "ready"
  | "pending"
  | "approved"
  | "rejected";

export type VirtualRunRound = {
  id: VirtualRunRoundId;
  order: number;
  label: string;
  theme: string;
  code: string;
  /** §9-3 회차 카드 색 */
  accent: "gold" | "red" | "blue";
};

export const VIRTUAL_RUN_ROUNDS: VirtualRunRound[] = [
  { id: "avengers", order: 1, label: "1회차", theme: "어벤져스", code: "AVENGERS", accent: "gold" },
  { id: "x-men", order: 2, label: "2회차", theme: "엑스맨", code: "X-MEN", accent: "red" },
  {
    id: "fantastic-four",
    order: 3,
    label: "3회차",
    theme: "판타스틱4",
    code: "FANTASTIC 4",
    accent: "blue",
  },
];

export function virtualRunRoundById(id: VirtualRunRoundId): VirtualRunRound {
  const found = VIRTUAL_RUN_ROUNDS.find((r) => r.id === id);
  if (!found) throw new Error(`unknown round: ${id}`);
  return found;
}

export const VIRTUAL_RUN_ROUND_CERT_STATUS_LABEL: Record<
  VirtualRunRoundCertStatus,
  string
> = {
  locked: "티켓 없음",
  ready: "인증 대기",
  pending: "검수 중",
  approved: "승인",
  rejected: "반려",
};
