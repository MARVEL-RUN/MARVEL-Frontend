"use client";

import { type CSSProperties, useEffect, useLayoutEffect, useRef } from "react";
import { scrambleNodes } from "./scramble";

const COLORS = ["var(--marvel-hi)", "var(--round-gold)", "var(--round-red)", "var(--round-blue)"];
const STAGGER_MS = 170;
const CLICK_MS = 150;
const HOLD_MS = 240;
const NO_SCRAMBLE = new Set(["LOGO", "TIMER", "MENU"]);

type Rect = { x: number; y: number; w: number; h: number };
type Grab = {
  el: HTMLElement;
  carry: boolean;
  /** 0 이동 중, 1 클릭, 2 그리기·옮기기 */
  step: 0 | 1 | 2;
  at: number;
  holdUntil: number;
};
type Cursor = { x: number; y: number; tx: number; ty: number; grab: Grab | null };
type Loose = { dx: number; dy: number; fx: number; fy: number };

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const sign = () => (Math.random() < 0.5 ? -1 : 1);
const clamp = (v: number, a: number, b: number) => (a > b ? (a + b) / 2 : Math.min(b, Math.max(a, v)));

let played = false;

const pickTargets = () =>
  Array.from(document.querySelectorAll<HTMLElement>("[data-vr-pick]")).filter(
    (el) => el.getClientRects().length > 0,
  );

const placeAll = () => {
  document.querySelectorAll<HTMLElement>("[data-vr-pick]").forEach((el) => {
    el.dataset.placed = "";
    el.style.removeProperty("clip-path");
    el.style.removeProperty("translate");
  });
};

export function HomeCursors({ startDelay = 0 }: { startDelay?: number }) {
  const layerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (played || window.matchMedia("(prefers-reduced-motion: reduce)").matches) placeAll();
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer || played) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cursorEls = Array.from(layer.querySelectorAll<HTMLElement>(".vr-cursor"));
    const boxEls = Array.from(layer.querySelectorAll<HTMLElement>(".vr-pick-box"));
    const tagEls = boxEls.map((b) => b.querySelector<HTMLElement>(".vr-pick-box__tag"));
    const targets = pickTargets();
    const stops: (() => void)[] = [];
    const loose = new Map<HTMLElement, Loose>();

    // html zoom을 쓰면 브라우저마다 rect 단위가 달라서 레이어 실측으로 환산
    const rectOf = (el: HTMLElement): Rect => {
      const f = layer.getBoundingClientRect();
      const s = f.width / (layer.offsetWidth || 1);
      const r = el.getBoundingClientRect();
      return { x: (r.left - f.left) / s, y: (r.top - f.top) / s, w: r.width / s, h: r.height / s };
    };

    const W = layer.offsetWidth;
    const H = layer.offsetHeight;
    const reach = clamp(W / 1100, 0.4, 1);

    for (const el of targets) {
      delete el.dataset.placed;
      if (el.closest(".site-header")) continue;
      const r = rectOf(el);
      const dx = clamp(sign() * rand(70, 200) * reach, 12 - r.x, W - 12 - r.x - r.w);
      const dy = clamp(sign() * rand(30, 110) * reach, 70 - r.y, H - 12 - r.y - r.h);
      loose.set(el, { dx, dy, fx: rand(0.25, 0.75), fy: rand(0.3, 0.7) });
      el.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
    }

    const cursors: Cursor[] = COLORS.map(() => {
      const x = W * 0.6 + rand(-40, 40);
      const y = H * 0.45 + rand(-40, 40);
      return { x, y, tx: x, ty: y, grab: null };
    });

    const queue = [...targets];
    let nextAt = performance.now() + startDelay;
    let shown = false;
    let leaving = 0;
    let last = performance.now();
    let frame = 0;

    const reveal = (g: Grab, i: number, r: Rect) => {
      g.el.dataset.placed = "";
      boxEls[i].classList.add("is-on");
      const tag = tagEls[i];
      if (tag) tag.textContent = `${g.el.dataset.vrPick} ${Math.round(r.w)}×${Math.round(r.h)}`;
      if (!NO_SCRAMBLE.has(g.el.dataset.vrPick ?? "")) stops.push(scrambleNodes(g.el));
    };

    const release = (c: Cursor, i: number) => {
      boxEls[i].classList.remove("is-on");
      c.grab = null;
    };

    const tick = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;

      if (now >= nextAt && !leaving) {
        if (!shown) {
          shown = true;
          layer.classList.add("is-on");
        }
        const free = cursors.find((c) => !c.grab);
        if (free && queue.length) {
          const el = queue.shift()!;
          free.grab = { el, carry: loose.has(el), step: 0, at: now, holdUntil: 0 };
          nextAt = now + STAGGER_MS;
        } else if (!queue.length && cursors.every((c) => !c.grab)) {
          leaving = now;
          played = true;
          layer.classList.remove("is-on");
          for (const c of cursors) {
            c.tx = c.x + sign() * rand(80, 160);
            c.ty = c.y + rand(60, 140);
          }
        }
      }

      cursors.forEach((c, i) => {
        const g = c.grab;
        const lo = g ? loose.get(g.el) : undefined;

        if (g) {
          const r = rectOf(g.el);
          if (g.step === 0) {
            c.tx = lo ? r.x + r.w * lo.fx : r.x;
            c.ty = lo ? r.y + r.h * lo.fy : r.y;
            if (Math.hypot(c.tx - c.x, c.ty - c.y) < 2) {
              c.x = c.tx;
              c.y = c.ty;
              g.step = 1;
              g.at = now;
              cursorEls[i].classList.add("is-down");
              reveal(g, i, r);
            }
          } else if (g.step === 1) {
            if (now - g.at >= (g.carry ? CLICK_MS : 0)) {
              g.step = 2;
              if (!g.carry) cursorEls[i].classList.remove("is-down");
            }
          } else if (lo) {
            c.tx = r.x - lo.dx + r.w * lo.fx;
            c.ty = r.y - lo.dy + r.h * lo.fy;
            if (Math.hypot(lo.dx, lo.dy) < 0.6 || Math.hypot(c.tx - c.x, c.ty - c.y) < 0.4) {
              if (!g.holdUntil) {
                g.holdUntil = now + HOLD_MS;
                lo.dx = 0;
                lo.dy = 0;
                g.el.style.removeProperty("translate");
                cursorEls[i].classList.remove("is-down");
              } else if (now >= g.holdUntil) release(c, i);
            }
          } else {
            c.tx = r.x + r.w;
            c.ty = r.y + r.h;
            if (Math.hypot(c.tx - c.x, c.ty - c.y) < 1.5) {
              if (!g.holdUntil) {
                g.holdUntil = now + HOLD_MS;
                g.el.style.removeProperty("clip-path");
              } else if (now >= g.holdUntil) release(c, i);
            }
          }
        }

        const speed = !g ? 0.05 : g.step === 0 ? 0.16 : g.carry ? 0.1 : 0.13;
        const k = 1 - Math.pow(1 - speed, dt / 16.7);
        const px = c.x;
        const py = c.y;
        c.x += (c.tx - c.x) * k;
        c.y += (c.ty - c.y) * k;
        cursorEls[i].style.transform = `translate(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px)`;

        if (!g || g.step === 0) return;
        const box = boxEls[i].style;

        if (lo) {
          if (g.step === 2 && !g.holdUntil) {
            lo.dx += c.x - px;
            lo.dy += c.y - py;
            g.el.style.translate = `${lo.dx.toFixed(1)}px ${lo.dy.toFixed(1)}px`;
          }
          const r = rectOf(g.el);
          box.transform = `translate(${r.x.toFixed(1)}px, ${r.y.toFixed(1)}px)`;
          box.width = `${r.w.toFixed(1)}px`;
          box.height = `${r.h.toFixed(1)}px`;
          return;
        }

        const r = rectOf(g.el);
        const bw = g.holdUntil ? r.w : Math.min(r.w, Math.max(0, c.x - r.x));
        const bh = g.holdUntil ? r.h : Math.min(r.h, Math.max(0, c.y - r.y));
        if (!g.holdUntil) {
          g.el.style.clipPath = `inset(0 ${(r.w - bw).toFixed(1)}px ${(r.h - bh).toFixed(1)}px 0)`;
        }
        box.transform = `translate(${r.x.toFixed(1)}px, ${r.y.toFixed(1)}px)`;
        box.width = `${bw.toFixed(1)}px`;
        box.height = `${bh.toFixed(1)}px`;
      });

      if (leaving && now - leaving > 900) {
        frame = 0;
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      for (const stop of stops) stop();
      placeAll();
    };
  }, [startDelay]);

  return (
    <div className="vr-cursors" ref={layerRef} aria-hidden>
      {COLORS.map((color, i) => (
        <div key={i} style={{ "--c": color } as CSSProperties}>
          <span className="vr-pick-box">
            <span className="vr-pick-box__tag" />
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="vr-cursor">
            <svg viewBox="0 0 16 18" width="20" height="22">
              <path d="M1.5 1.5v13l3.6-3.3 2.4 5.3 2.3-1-2.4-5.2h4.9z" />
            </svg>
          </span>
        </div>
      ))}
    </div>
  );
}
