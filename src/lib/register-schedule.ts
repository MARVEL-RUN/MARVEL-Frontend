import { EVENT } from "@/lib/event";
import { registrationForced } from "@/lib/mode";

export type CountdownSlots = {
  d: string;
  h: string;
  m: string;
  s: string;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function countdownSlotsTo(targetMs: number, now = Date.now()): CountdownSlots | null {
  const ms = targetMs - now;
  if (ms <= 0) return null;
  const sec = Math.floor(ms / 1000);
  return {
    d: pad2(Math.floor(sec / 86400)),
    h: pad2(Math.floor((sec % 86400) / 3600)),
    m: pad2(Math.floor((sec % 3600) / 60)),
    s: pad2(sec % 60),
  };
}

const round2PauseFrom = () => Date.parse(EVENT.round2PauseFrom);
const round2OpenAt = () => Date.parse(EVENT.round2OpenAt);

/** 1차 마감 ~ 2차 오픈 전 (예: 10/13 00:00 ~ 10/13 14:00 KST) */
export function isRegistrationRound2Pause(now = Date.now()) {
  const flag = process.env.NEXT_PUBLIC_REGISTRATION_ROUND2_PAUSE;
  if (flag === "0") return false;
  /* 로컬·스테이징: 접수 오픈 상태에서 2차 대기 UI만 강제 */
  if (flag === "1") return registrationForced !== false;
  if (registrationForced === true) return false;
  const from = round2PauseFrom();
  const until = round2OpenAt();
  if (!Number.isFinite(from) || !Number.isFinite(until) || from >= until) return false;
  return now >= from && now < until;
}

export function registrationRound2OpenAtMs() {
  return round2OpenAt();
}

/** 2차 대기 안내 UI — `tooltip`(기본) | `standby`(접수 OPEN 전과 동일 전체 모달) */
export function registrationRound2HintUi(): "tooltip" | "standby" {
  const mode = process.env.NEXT_PUBLIC_REGISTRATION_ROUND2_UI?.trim().toLowerCase();
  if (mode === "standby" || mode === "full" || mode === "modal") return "standby";
  return "tooltip";
}
