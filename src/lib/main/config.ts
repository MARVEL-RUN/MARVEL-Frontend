export const MAIN_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ?? "";

export const TOSS_CLIENT_KEY =
  process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY?.trim() ?? "";

/** 테스트 `test-marvelrun`, 운영 `marvelrun2026` — NEXT_PUBLIC_EVENT_ID */
export const DEFAULT_EVENT_ID =
  process.env.NEXT_PUBLIC_EVENT_ID?.trim() ?? "";

export const hasMainApi = MAIN_API_BASE.length > 0;
export const hasTossClientKey = TOSS_CLIENT_KEY.length > 0;

/** `off` 끄기, `on` 기본 `/audio/bgm.mp3`. 로컬에서 없으면 `on`과 동일 */
export const BGM_SRC = (() => {
  const raw = process.env.NEXT_PUBLIC_BGM?.trim().toLowerCase();
  if (!raw || raw === "on") return "/audio/bgm.mp3";
  if (raw === "off") return null;
  return raw;
})();
