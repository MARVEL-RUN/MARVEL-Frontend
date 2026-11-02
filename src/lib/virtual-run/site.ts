/** 로컬·UI 확인 — SMS·결제·검수 없이 통과 (NEXT_PUBLIC_VIRTUAL_RUN_DEMO=1) */
export const virtualRunDemoEnabled =
  process.env.NEXT_PUBLIC_VIRTUAL_RUN_DEMO === "1" ||
  process.env.NODE_ENV === "development";

export const virtualRunSpotsEnabled =
  process.env.NEXT_PUBLIC_VIRTUAL_RUN_SPOTS === "1" || virtualRunDemoEnabled;
