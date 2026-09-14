export const MOBILE_MAX = 720;

export const MOBILE_MQ = `(max-width: ${MOBILE_MAX}px)`;

export function isMobileView() {
  return window.matchMedia(MOBILE_MQ).matches;
}

/* iOS는 키보드가 innerHeight를 안 줄임 */
export function keyboardCover() {
  const vv = window.visualViewport;
  if (!vv) return 0;
  return Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
}
