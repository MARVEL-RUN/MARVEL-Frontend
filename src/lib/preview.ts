/** 공개 내비·사이트맵에 없는 미리보기 경로. 브레인/마블런에만 공유 */
export const PREVIEW_BASE_PATH = "/entry-preview";

export function isPreviewPath(pathname: string) {
  return (
    pathname === PREVIEW_BASE_PATH ||
    pathname.startsWith(`${PREVIEW_BASE_PATH}/`)
  );
}

/** pathname이 미리보기면 base, 아니면 "" (기존 `/register` 등 유지) */
export function appBaseFromPath(pathname: string) {
  return isPreviewPath(pathname) ? PREVIEW_BASE_PATH : "";
}

export function withAppBase(base: string, path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
