import { virtualRunDemoEnabled } from "./site";

export const VIRTUAL_RUN_OPEN_AT = {
  publicInfo: "2026-11-02T00:00:00+09:00",
  ticketsAndMypageLogin: "2026-11-11T10:00:00+09:00",
  guideAndCertSubmit: "2026-11-27T00:00:00+09:00",
} as const;

export type VirtualRunOpenFlags = {
  publicInfo: boolean;
  tickets: boolean;
  mypageLogin: boolean;
  guide: boolean;
  certSubmit: boolean;
};

function isOpenAt(iso: string, now = new Date()): boolean {
  return now.getTime() >= new Date(iso).getTime();
}

/** 일단 전체 공개. 일정 재적용 시 false 로 두고 아래 스케줄 분기 사용 */
const VIRTUAL_RUN_NAV_FORCE_OPEN = true;

export function virtualRunOpenFlags(now = new Date()): VirtualRunOpenFlags {
  if (VIRTUAL_RUN_NAV_FORCE_OPEN || virtualRunDemoEnabled) {
    return {
      publicInfo: true,
      tickets: true,
      mypageLogin: true,
      guide: true,
      certSubmit: true,
    };
  }
  const publicInfo = isOpenAt(VIRTUAL_RUN_OPEN_AT.publicInfo, now);
  return {
    publicInfo,
    tickets: isOpenAt(VIRTUAL_RUN_OPEN_AT.ticketsAndMypageLogin, now),
    mypageLogin: isOpenAt(VIRTUAL_RUN_OPEN_AT.ticketsAndMypageLogin, now),
    guide: isOpenAt(VIRTUAL_RUN_OPEN_AT.guideAndCertSubmit, now),
    certSubmit: isOpenAt(VIRTUAL_RUN_OPEN_AT.guideAndCertSubmit, now),
  };
}
