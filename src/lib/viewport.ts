export const MOBILE_MAX = 720;

export function isMobileView() {
  return window.matchMedia(`(max-width: ${MOBILE_MAX}px)`).matches;
}
