export const RUNNING_CERT_PERIOD = {
  start: "2026-11-30",
  end: "2027-01-19",
} as const;

export const RUNNING_CERT_MIN_KM = 5;

export const RUNNING_CERT_HASHTAGS =
  "#MARVELRUN2026 #MARVELRUN #버추얼런 (기획 확정 시 수정)";

export const RUNNING_RECORD_TOOLS = [
  { id: "app", label: "러닝 앱" },
  { id: "watch", label: "스마트워치" },
  { id: "treadmill", label: "트레드밀" },
  { id: "other", label: "기타" },
] as const;

export type RunningRecordToolId = (typeof RUNNING_RECORD_TOOLS)[number]["id"];

export type VirtualRunSessionRound = {
  id: string;
  label: string;
  theme: string;
  certified: boolean;
};

/** API 연동 전 — 미인증 회차만 셀렉트에 노출 */
export const DEMO_SESSION_ROUNDS: VirtualRunSessionRound[] = [
  { id: "1", label: "1회차", theme: "어벤저스", certified: true },
  { id: "2", label: "2회차", theme: "엑스맨", certified: false },
  { id: "3", label: "3회차", theme: "판타스틱4", certified: false },
];

const INSTAGRAM_PATH = /^https?:\/\/(www\.)?instagram\.com\/(p|reel)\/[\w-]+\/?(\?.*)?$/i;

export function parseDurationParts(h: string, m: string, s: string): number | null {
  const hh = Number.parseInt(h, 10);
  const mm = Number.parseInt(m, 10);
  const ss = Number.parseInt(s, 10);
  if (![hh, mm, ss].every((n) => Number.isFinite(n) && n >= 0)) return null;
  if (mm >= 60 || ss >= 60) return null;
  if (hh === 0 && mm === 0 && ss === 0) return null;
  return hh * 3600 + mm * 60 + ss;
}

export function formatPaceMinPerKm(totalSeconds: number, distanceKm: number): string | null {
  if (distanceKm < RUNNING_CERT_MIN_KM || totalSeconds <= 0) return null;
  const paceSec = totalSeconds / distanceKm;
  const paceMin = Math.floor(paceSec / 60);
  const paceRem = Math.round(paceSec % 60);
  return `${paceMin}'${String(paceRem).padStart(2, "0")}" / km`;
}

export function isInstagramPostUrl(value: string): boolean {
  return INSTAGRAM_PATH.test(value.trim());
}

export function localDateYmd(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isWithinCertPeriod(ymd: string, now = new Date()): boolean {
  if (!ymd) return false;
  const day = ymd.slice(0, 10);
  if (day < RUNNING_CERT_PERIOD.start || day > RUNNING_CERT_PERIOD.end) return false;
  return day <= localDateYmd(now);
}

export function runningCertDateMax(now = new Date()): string {
  const today = localDateYmd(now);
  return today < RUNNING_CERT_PERIOD.end ? today : RUNNING_CERT_PERIOD.end;
}

export function parseDistanceKm(raw: string): number | null {
  const n = Number.parseFloat(raw.replace(",", "."));
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100) / 100;
}
