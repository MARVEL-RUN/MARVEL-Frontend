export const MAIN_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ?? "";

export const TOSS_CLIENT_KEY =
  process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY?.trim() ?? "";

/** 테스트 대회. 목록 API 오면 설정/조회로 교체 */
export const DEFAULT_EVENT_ID = "test-marvelrun";

export const hasMainApi = MAIN_API_BASE.length > 0;
export const hasTossClientKey = TOSS_CLIENT_KEY.length > 0;
