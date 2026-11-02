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

export function virtualRunOpenFlags(now = new Date()): VirtualRunOpenFlags {
  if (virtualRunDemoEnabled) {
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
