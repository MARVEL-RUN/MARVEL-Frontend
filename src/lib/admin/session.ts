const EXPIRED_EVENT = "mr-admin-session-expired";

let notified = false;

export function notifySessionExpired() {
  if (typeof window === "undefined" || notified) return;
  notified = true;
  window.dispatchEvent(new Event(EXPIRED_EVENT));
}

export function resetSessionExpired() {
  notified = false;
}

export function onSessionExpired(listener: () => void) {
  window.addEventListener(EXPIRED_EVENT, listener);
  return () => window.removeEventListener(EXPIRED_EVENT, listener);
}

export function adminLoginHref() {
  if (typeof window === "undefined") return "/admin/login";
  const url = new URL(window.location.href);
  url.searchParams.delete("preview");
  const next = safeAdminNext(`${url.pathname}${url.search}`);
  return next === "/admin" ? "/admin/login" : `/admin/login?next=${encodeURIComponent(next)}`;
}

/** /admin 하위 경로만 허용. 외부 주소로 튕기지 않게 */
export function safeAdminNext(value: string | null | undefined) {
  if (!value || !value.startsWith("/admin") || value.startsWith("//")) return "/admin";
  if (value.startsWith("/admin/login")) return "/admin";
  return value;
}
