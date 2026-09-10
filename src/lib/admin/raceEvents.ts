export const ADMIN_RACE_EVENTS = [
  {
    id: "marvel",
    name: "마블런",
    allowsGroup: true,
    hasRounds: false,
    periodLabel: "2026.09.22 ~ 2026.10.20",
    summary: "개인 · 단체",
  },
  {
    id: "virtual",
    name: "마블 버추얼런",
    allowsGroup: false,
    hasRounds: true,
    periodLabel: "1~3차 차수별 접수",
    summary: "개인 · 1~3차",
  },
] as const;

export type AdminRaceEventId = (typeof ADMIN_RACE_EVENTS)[number]["id"];
export type VirtualRoundId = "1" | "2" | "3";

export function getAdminRaceEvent(id: string) {
  return ADMIN_RACE_EVENTS.find((event) => event.id === id) ?? null;
}

export const VIRTUAL_ROUND_LABEL: Record<VirtualRoundId, string> = {
  "1": "1차",
  "2": "2차",
  "3": "3차",
};
