"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { VirtualRunKitItem, VirtualRunKitItemKind } from "@/lib/virtual-run/kit";
import { kitSectionId } from "./kit-section-id";

function headerBottomPx() {
  const bar = document.querySelector(".site-header__bar");
  return bar instanceof HTMLElement ? bar.getBoundingClientRect().bottom : 0;
}

function itemPinEl(item: VirtualRunKitItem): HTMLElement | null {
  const root = document.getElementById(kitSectionId(item.kind));
  if (!root) return null;
  if (item.kind === "medal-back") {
    const back = root.querySelectorAll(".vr-kit__shot")[1];
    if (back instanceof HTMLElement) return back;
  }
  return root;
}

function itemRect(item: VirtualRunKitItem): DOMRect | null {
  const el = itemPinEl(item);
  return el ? el.getBoundingClientRect() : null;
}

function revealLink(link: HTMLElement, scroller: HTMLElement) {
  const linkBox = link.getBoundingClientRect();
  const box = scroller.getBoundingClientRect();
  if (linkBox.left >= box.left && linkBox.right <= box.right) return;
  const left = linkBox.left - box.left + scroller.scrollLeft - (box.width - linkBox.width) / 2;
  scroller.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
}

function pinToItem(item: VirtualRunKitItem, navEl: HTMLElement | null, smooth: boolean) {
  const el = itemPinEl(item);
  if (!el) return;
  const bar = document.querySelector(".site-header__bar");
  const headerH = bar instanceof HTMLElement ? bar.getBoundingClientRect().height : 0;
  const navH = navEl?.getBoundingClientRect().height ?? 0;
  const top = window.scrollY + el.getBoundingClientRect().top - headerH - navH;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({
    top: Math.max(0, top),
    behavior: smooth && !reduce ? "smooth" : "auto",
  });
}

function resolveActiveKind(line: number, items: readonly VirtualRunKitItem[]) {
  let kind: VirtualRunKitItemKind | "" = "";
  for (const item of items) {
    const rect = itemRect(item);
    if (!rect) continue;
    if (rect.top <= line) kind = item.kind;
    else if (kind !== "") break;
  }
  return kind || items[0]?.kind || "";
}

type Props = {
  items: readonly VirtualRunKitItem[];
};

export function VirtualRunKitManifestNav({ items }: Props) {
  const slotRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const jumping = useRef(false);
  const [stuck, setStuck] = useState(false);
  const [activeKind, setActiveKind] = useState<VirtualRunKitItemKind | "">("");

  useEffect(() => {
    const sync = () => {
      const slot = slotRef.current;
      const nav = navRef.current;
      if (!slot || !nav) return;

      const headerBottom = headerBottomPx();
      setStuck(slot.getBoundingClientRect().top <= headerBottom + 0.5);

      if (jumping.current) return;

      const line = headerBottom + nav.getBoundingClientRect().height + 4;
      const current = resolveActiveKind(line, items);
      setActiveKind((prev) => (prev === current ? prev : current));
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [items]);

  useEffect(() => {
    if (!activeKind || !trackRef.current) return;
    const link = trackRef.current.querySelector<HTMLAnchorElement>(
      `a[data-kind="${activeKind}"]`,
    );
    const scroller = navRef.current;
    if (link && scroller) revealLink(link, scroller);
  }, [activeKind]);

  function go(event: MouseEvent<HTMLAnchorElement>, item: VirtualRunKitItem) {
    const target = itemPinEl(item);
    if (!target) return;
    event.preventDefault();
    jumping.current = true;
    setActiveKind(item.kind);
    pinToItem(item, navRef.current, true);
    history.replaceState(null, "", `#${kitSectionId(item.kind)}`);
    window.setTimeout(() => {
      jumping.current = false;
      const nav = navRef.current;
      if (!nav) return;
      const line = headerBottomPx() + nav.getBoundingClientRect().height + 4;
      setActiveKind(resolveActiveKind(line, items));
    }, 1100);
  }

  return (
    <div className="vr-kit__manifest-slot" ref={slotRef}>
      <nav
        ref={navRef}
        className={
          stuck ? "vr-kit__manifest-track is-stuck" : "vr-kit__manifest-track"
        }
        aria-label="키트 구성"
      >
        <ul className="vr-kit__manifest" ref={trackRef}>
          {items.map((item) => {
            const id = kitSectionId(item.kind);
            const on = activeKind === item.kind;
            return (
              <li key={item.kind}>
                <a
                  href={`#${id}`}
                  data-kind={item.kind}
                  className={on ? "vr-kit__manifest-link is-on" : "vr-kit__manifest-link"}
                  aria-current={on ? "location" : undefined}
                  onClick={(event) => go(event, item)}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
