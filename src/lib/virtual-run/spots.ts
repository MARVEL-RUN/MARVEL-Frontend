export type VirtualRunSpotId = "buffetground" | "sono";

export type VirtualRunSpot = {
  id: VirtualRunSpotId;
  label: string;
  note: string;
};

/** 협의 중 — 확정 전까지 목록만 */
export const VIRTUAL_RUN_SPOTS: VirtualRunSpot[] = [
  { id: "buffetground", label: "버핏그라운드", note: "운영 기간은 협업 확정 후 안내" },
  { id: "sono", label: "소노호텔&리조트", note: "운영 기간은 협업 확정 후 안내" },
];

/** 주최 확정 전 가안 */
export const SPOT_CERT_HASHTAGS = ["#MARVELRUN2026", "#마블버추얼런", "#버추얼런거점"] as const;
