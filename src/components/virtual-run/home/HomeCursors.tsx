"use client";

import { type CSSProperties, useEffect, useRef } from "react";

const COLORS = ["var(--marvel-hi)", "var(--round-gold)", "var(--round-red)", "var(--round-blue)"];
const STAGGER_MS = 200;
const HOLD_MS = 220;

type Point = { x: number; y: number };

type Grab = {
  el: HTMLElement;
  fx: number;
  fy: number;
  attached: boolean;
  holdUntil: number;
};

type Cursor = Point & { tx: number; ty: number; grab: Grab | null };

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const sign = () => (Math.random() < 0.5 ? -1 : 1);

export function HomeCursors({ startDelay = 0 }: { startDelay?: number }) {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cursorEls = Array.from(layer.querySelectorAll<HTMLElement>(".vr-cursor"));
    const boxEls = Array.from(layer.querySelectorAll<HTMLElement>(".vr-pick-box"));
    const tagEls = boxEls.map((b) => b.querySelector<HTMLElement>(".vr-pick-box__tag"));
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-vr-pick]")).filter(
      (el) => el.getClientRects().length > 0,
    );
    if (!targets.length) return;

    // html zoom을 쓰면 브라우저마다 rect 단위가 달라서 레이어 실측으로 환산
    const frameOf = () => {
      const r = layer.getBoundingClientRect();
      return { left: r.left, top: r.top, s: r.width / (layer.offsetWidth || 1) };
    };

    const offsets = new Map<HTMLElement, Point>();
    const setOffset = (el: HTMLElement, p: Point | null) => {
      if (!p || (Math.abs(p.x) < 0.5 && Math.abs(p.y) < 0.5)) {
        offsets.delete(el);
        el.style.removeProperty("translate");
        return;
      }
      offsets.set(el, p);
      el.style.translate = `${p.x.toFixed(1)}px ${p.y.toFixed(1)}px`;
    };

    const homeOf = (el: HTMLElement) => {
      const f = frameOf();
      const r = el.getBoundingClientRect();
      const o = offsets.get(el) ?? { x: 0, y: 0 };
      return {
        x: (r.left - f.left) / f.s - o.x,
        y: (r.top - f.top) / f.s - o.y,
        w: r.width / f.s,
        h: r.height / f.s,
      };
    };

    const W = layer.offsetWidth;
    const H = layer.offsetHeight;
    const reach = Math.min(1, Math.max(0.4, W / 1100));

    for (const el of targets) {
      setOffset(el, { x: sign() * rand(36, 90) * reach, y: sign() * rand(16, 44) * reach });
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

    const tick = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;

      if (now >= nextAt && !leaving) {
        if (!shown) {
          shown = true;
          layer.classList.add("is-on");
        }
        const free = cursors.find((c) => !c.grab);
        const el = queue.shift();
        if (free && el) {
          free.grab = { el, fx: rand(0.2, 0.8), fy: rand(0.35, 0.75), attached: false, holdUntil: 0 };
          nextAt = now + STAGGER_MS;
        } else if (el) {
          queue.unshift(el);
        } else if (cursors.every((c) => !c.grab)) {
          leaving = now;
          layer.classList.remove("is-on");
          for (const c of cursors) {
            c.tx = c.x + sign() * rand(80, 160);
            c.ty = c.y + rand(60, 140);
          }
        }
      }

      cursors.forEach((c, i) => {
        const g = c.grab;
        if (g) {
          const home = homeOf(g.el);
          const ax = home.x + home.w * g.fx;
          const ay = home.y + home.h * g.fy;
          if (!g.attached) {
            const o = offsets.get(g.el) ?? { x: 0, y: 0 };
            c.tx = ax + o.x;
            c.ty = ay + o.y;
            if (Math.hypot(c.tx - c.x, c.ty - c.y) < 2) {
              g.attached = true;
              boxEls[i].classList.add("is-on");
              const tag = tagEls[i];
              if (tag) tag.textContent = `${g.el.dataset.vrPick} ${Math.round(home.w)}×${Math.round(home.h)}`;
            }
          } else {
            c.tx = ax;
            c.ty = ay;
            setOffset(g.el, { x: c.x - ax, y: c.y - ay });
            if (Math.hypot(c.tx - c.x, c.ty - c.y) < 1.5) {
              if (!g.holdUntil) g.holdUntil = now + HOLD_MS;
              else if (now >= g.holdUntil) {
                setOffset(g.el, null);
                boxEls[i].classList.remove("is-on");
                c.grab = null;
              }
            }
          }
        }

        const k = 1 - Math.pow(1 - (c.grab ? 0.16 : 0.05), dt / 16.7);
        c.x += (c.tx - c.x) * k;
        c.y += (c.ty - c.y) * k;
        cursorEls[i].style.transform = `translate(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px)`;

        if (c.grab?.attached) {
          const f = frameOf();
          const r = c.grab.el.getBoundingClientRect();
          const box = boxEls[i].style;
          box.transform = `translate(${((r.left - f.left) / f.s).toFixed(1)}px, ${((r.top - f.top) / f.s).toFixed(1)}px)`;
          box.width = `${(r.width / f.s).toFixed(1)}px`;
          box.height = `${(r.height / f.s).toFixed(1)}px`;
        }
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
      for (const el of targets) el.style.removeProperty("translate");
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
