const LATIN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*/<>";
const HANGUL = "마블런버추얼어벤져스엑스맨판타스틱완주인증회차";
export const SCRAMBLE_FRAME_MS = 42;

const pick = (set: string) => set[Math.floor(Math.random() * set.length)];

export function scrambleChar(ch: string) {
  if (/[\s·.,:()\-–]/.test(ch)) return ch;
  return /[가-힣]/.test(ch) ? pick(HANGUL) : pick(LATIN);
}

export function scrambleFrame(chars: string[], t: number) {
  const settled = Math.floor(t * chars.length);
  return chars.map((ch, i) => (i < settled ? ch : scrambleChar(ch))).join("");
}

/** el 안 텍스트 노드를 직접 바꿨다가 원문으로 되돌림. 반환값은 즉시 복구 */
export function scrambleNodes(el: HTMLElement, duration = 640) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes: { node: Text; chars: string[]; text: string }[] = [];
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const text = node.nodeValue ?? "";
    if (text.trim()) nodes.push({ node, chars: Array.from(text), text });
  }
  if (!nodes.length) return () => {};

  const restore = () => {
    for (const n of nodes) n.node.nodeValue = n.text;
  };
  const start = performance.now();
  const id = window.setInterval(() => {
    const t = Math.min(1, (performance.now() - start) / duration);
    for (const n of nodes) n.node.nodeValue = scrambleFrame(n.chars, t);
    if (t >= 1) {
      window.clearInterval(id);
      restore();
    }
  }, SCRAMBLE_FRAME_MS);

  return () => {
    window.clearInterval(id);
    restore();
  };
}
