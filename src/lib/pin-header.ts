/** css zoom이 있어서 getBoundingClientRect만으로는 헤더 하단이 안 맞는다 */
export function pinToHeader(el: HTMLElement, smooth = false) {
  const pin = (el.querySelector(":scope > .guide-rule") as HTMLElement | null) ?? el;
  const bar = document.querySelector(".site-header__bar");
  const tabs = document.querySelector(".guide-tabs");
  const zoom = Number.parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
  let y = 0;
  for (let n: HTMLElement | null = pin; n; n = n.offsetParent as HTMLElement | null) {
    y += n.offsetTop;
  }
  const headerH = bar instanceof HTMLElement ? bar.offsetHeight : 0;
  const tabsH =
    el.id === "overview" || !(tabs instanceof HTMLElement) ? 0 : tabs.offsetHeight;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({
    top: Math.max(0, (y - headerH - tabsH) * zoom),
    behavior: smooth && !reduce ? "smooth" : "auto",
  });
}
