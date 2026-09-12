/** css zoom이 있어서 window.scrollTo만으로는 맨 위가 안 잡힐 수 있다 */
export function scrollPageTop() {
  const page = document.querySelector(".page");
  page?.scrollIntoView({ block: "start", behavior: "auto" });
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}
