export const MOBILE_MAX = 720;

/* main.css @media도 이 문자열과 같게 */
export const MOBILE_MQ = `(max-width: ${MOBILE_MAX}px), (orientation: landscape) and (max-height: 500px) and (max-width: 960px)`;

/* 폭만 본다 — 높이·비율 조건은 주소창 때문에 스크롤 중 뒤집힘 */
export const MOBILE_WIDTH_MQ = `(max-width: ${MOBILE_MAX}px)`;

export function isMobileView() {
  return window.matchMedia(MOBILE_MQ).matches;
}

/* iOS 팬(offsetTop)은 빼지 않음. 치면 --kb가 흔들림 */
export function keyboardCover() {
  const vv = window.visualViewport;
  if (!vv) return 0;
  return Math.max(0, window.innerHeight - vv.height);
}
