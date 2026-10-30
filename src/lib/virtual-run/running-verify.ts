export const VIRTUAL_RUN_VERIFY_PERIOD = {
  start: "2026-11-30",
  end: "2027-01-19",
} as const;

export const VIRTUAL_RUN_RECORD_TOOLS = [
  { value: "app", label: "러닝 앱" },
  { value: "watch", label: "스마트워치" },
  { value: "treadmill", label: "트레드밀" },
  { value: "other", label: "기타" },
] as const;

export type VirtualRunRecordTool = (typeof VIRTUAL_RUN_RECORD_TOOLS)[number]["value"];

/** API 연동 전 — 미인증 회차 목록 UI 샘플 */
export type VirtualRunPendingRound = {
  id: string;
  label: string;
  theme: string;
};

export const VIRTUAL_RUN_PENDING_ROUNDS_MOCK: VirtualRunPendingRound[] = [
  { id: "r1", label: "1회차", theme: "어벤저스" },
  { id: "r2", label: "2회차", theme: "엑스맨" },
  { id: "r3", label: "3회차", theme: "판타스틱4" },
];

export const VIRTUAL_RUN_INSTAGRAM_HASHTAGS =
  "#MARVELRUN2026 #마블런2026 #버추얼런 (행사 안내 기준 해시태그를 확인하세요)";

export const VIRTUAL_RUN_RUNNING_VERIFY_NOTICES = [
  "회차당 러닝 인증은 1회만 승인됩니다.",
  "달린 날짜는 인증 기간(11/30~1/19) 안이어야 하며, 미래 날짜는 선택할 수 없습니다.",
  "거리는 5.00km 이상, 기록 스크린샷에 거리·시간·날짜가 한 화면에 보여야 합니다.",
  "트레드밀은 계기판 사진을 제출해 주세요.",
] as const;

export function parseDurationToSeconds(raw: string): number | null {
  const parts = raw.trim().split(":").map((p) => p.trim());
  if (parts.length !== 3) return null;
  const [h, m, s] = parts.map((p) => Number.parseInt(p, 10));
  if ([h, m, s].some((n) => !Number.isFinite(n) || n < 0)) return null;
  if (m >= 60 || s >= 60) return null;
  return h * 3600 + m * 60 + s;
}

export function formatPaceMinPerKm(distanceKm: number, seconds: number): string | null {
  if (distanceKm < 5 || seconds <= 0) return null;
  const paceSec = seconds / distanceKm;
  const min = Math.floor(paceSec / 60);
  const sec = Math.round(paceSec % 60);
  return `${min}'${String(sec).padStart(2, "0")}" / km`;
}

export function isInstagramPostUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\./, "");
    if (host !== "instagram.com") return false;
    return /^\/(p|reel)\/[^/]+/.test(u.pathname);
  } catch {
    return false;
  }
}
