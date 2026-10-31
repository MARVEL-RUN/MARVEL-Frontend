"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { VirtualRunKitItem } from "@/lib/virtual-run/kit";
import { kitSectionId } from "./kit-section-id";

function headerBottomPx() {
  const bar = document.querySelector(".site-header__bar");
  return bar instanceof HTMLElement ? bar.getBoundingClientRect().bottom : 0;
}

function pinToKitSection(id: string, navEl: HTMLElement | null, smooth: boolean) {
  const el = document.getElementById(id);
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

function resolveActiveSection(line: number) {
  const anchors = document.querySelectorAll<HTMLElement>(".vr-kit .vr-kit__anchor[id]");
  let current = "";
  let bestTop = -Infinity;
  for (const el of anchors) {
    const top = el.getBoundingClientRect().top;
    if (top <= line && top > bestTop) {
      bestTop = top;
      current = el.id;
    }
  }
  return current;
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
  const [active, setActive] = useState("");

  useEffect(() => {
    const sync = () => {
      const slot = slotRef.current;
      const nav = navRef.current;
      if (!slot || !nav) return;

      const headerBottom = headerBottomPx();
      setStuck(slot.getBoundingClientRect().top <= headerBottom + 0.5);

      if (jumping.current) return;

      const line = headerBottom + nav.getBoundingClientRect().height + 4;
      const current = resolveActiveSection(line);
      setActive((prev) => (prev === current ? prev : current));
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
    if (!active || !trackRef.current) return;
    const link = trackRef.current.querySelector<HTMLAnchorElement>(`a[href="#${active}"]`);
    link?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [active]);

  function go(event: MouseEvent<HTMLAnchorElement>, id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    jumping.current = true;
    setActive(id);
    pinToKitSection(id, navRef.current, true);
    history.replaceState(null, "", `#${id}`);
    window.setTimeout(() => {
      jumping.current = false;
      const nav = navRef.current;
      if (!nav) return;
      const line = headerBottomPx() + nav.getBoundingClientRect().height + 4;
      setActive(resolveActiveSection(line));
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
            const on = active === id;
            return (
              <li key={item.kind}>
                <a
                  href={`#${id}`}
                  className={on ? "vr-kit__manifest-link is-on" : "vr-kit__manifest-link"}
                  aria-current={on ? "location" : undefined}
                  onClick={(event) => go(event, id)}
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
