"use client";

import { pinToHeader } from "@/lib/pin-header";
import { GUIDE_TABS } from "@/lib/mode";
import { useEffect, useRef, useState, type MouseEvent } from "react";

function sectionId(href: string) {
  return href.split("#")[1] ?? "";
}

type Tab = { readonly href: string; readonly label: string };

export function GuideTabs({
  items = GUIDE_TABS,
  label = "대회안내 바로가기",
  hideAfter,
}: {
  items?: readonly Tab[];
  label?: string;
  hideAfter?: string;
}) {
  const slotRef = useRef<HTMLDivElement>(null);
  const jumping = useRef(false);
  const [stuck, setStuck] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const sync = () => {
      const slot = slotRef.current;
      const bar = document.querySelector(".site-header__bar");
      if (!slot) return;
      const headerBottom =
        bar instanceof HTMLElement ? bar.getBoundingClientRect().bottom : 0;
      setStuck(slot.getBoundingClientRect().top <= headerBottom + 0.5);

      const tabs = document.querySelector(".guide-tabs");
      const line =
        headerBottom +
        (tabs instanceof HTMLElement ? tabs.getBoundingClientRect().height : 0) +
        4;

      if (hideAfter) {
        const end = document.getElementById(hideAfter);
        const bottom = end?.getBoundingClientRect().bottom ?? Number.POSITIVE_INFINITY;
        setHidden(bottom <= line);
      }

      if (jumping.current) return;
      let current = "";
      for (const item of items) {
        const id = sectionId(item.href);
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current);
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [hideAfter, items]);

  function go(event: MouseEvent<HTMLAnchorElement>, href: string) {
    const id = sectionId(href);
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    jumping.current = true;
    setActive(id);
    pinToHeader(target, true);
    history.replaceState(null, "", href);
    window.setTimeout(() => {
      jumping.current = false;
    }, 1100);
  }

  return (
    <div className="guide-tabs-slot" ref={slotRef}>
      <nav
        className={["guide-tabs", stuck ? "is-stuck" : "", hidden ? "is-hidden" : ""]
          .filter(Boolean)
          .join(" ")}
        aria-label={label}
        aria-hidden={hidden || undefined}
      >
        <div className="guide-tabs__inner">
          {items.map((item) => {
            const id = sectionId(item.href);
            const on = active === id;
            return (
              <a
                key={item.href}
                href={item.href}
                className={on ? "guide-tabs__btn is-on" : "guide-tabs__btn"}
                aria-current={on ? "true" : undefined}
                onClick={(event) => go(event, item.href)}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
