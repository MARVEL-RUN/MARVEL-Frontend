export type VirtualRunSpotId = "buffetground" | "sono";

export type VirtualRunSpot = {
  id: VirtualRunSpotId;
  label: string;
  note: string;
};

/** 협의 중 — UI 목록만 */
export const VIRTUAL_RUN_SPOTS: VirtualRunSpot[] = [
  { id: "buffetground", label: "버핏그라운드", note: "협업 확정 시 운영 기간 안내" },
  { id: "sono", label: "소노호텔&리조트", note: "협업 확정 시 운영 기간 안내" },
];

export const SPOT_CERT_HASHTAGS =
  "#MARVELRUN2026 #버추얼런거점 (기획 확정 시 수정)";
