/** 로컬·UI 확인 — SMS·결제·검수 없이 통과 (NEXT_PUBLIC_VIRTUAL_RUN_DEMO=1) */
export const virtualRunDemoEnabled =
  process.env.NEXT_PUBLIC_VIRTUAL_RUN_DEMO === "1" ||
  process.env.NODE_ENV === "development";

/** 일단 공개. 거점 미운영 시 false 로 두고 env / demo 만 사용 */
const VIRTUAL_RUN_SPOTS_FORCE_OPEN = true;

export const virtualRunSpotsEnabled =
  VIRTUAL_RUN_SPOTS_FORCE_OPEN ||
  process.env.NEXT_PUBLIC_VIRTUAL_RUN_SPOTS === "1" ||
  virtualRunDemoEnabled;
