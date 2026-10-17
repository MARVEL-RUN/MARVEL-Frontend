"use client";

import { useCallback, useEffect, useState } from "react";
import {
  discountLinkAcceptingRegistration,
  discountLinkStatusLabel,
} from "@/lib/discount-link/pricing";
import type { DiscountOptions } from "@/lib/discount-link/types";

type DiscountTab = "info" | "apply";

function scrollAnchor(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const root = document.documentElement;
  const header = parseFloat(getComputedStyle(root).getPropertyValue("--header-h")) || 0;
  const rail = document.querySelector(".discount-rail");
  const railH = rail?.getBoundingClientRect().height ?? 0;
  const top =
    target.getBoundingClientRect().top + window.scrollY - header - railH - 8;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

export function DiscountEntryMobileRail({
  options,
}: {
  options: DiscountOptions;
}) {
  const statusNote = discountLinkStatusLabel(options.linkStatus);
  const accepting = discountLinkAcceptingRegistration(options);
  const [tab, setTab] = useState<DiscountTab>("info");

  const go = useCallback((next: DiscountTab) => {
    setTab(next);
    scrollAnchor(next === "info" ? "discount-info" : "discount-apply");
  }, []);

  useEffect(() => {
    const info = document.getElementById("discount-info");
    const apply = document.getElementById("discount-apply");
    if (!info || !apply) return;

    const root = document.documentElement;
    const header = parseFloat(getComputedStyle(root).getPropertyValue("--header-h")) || 0;
    const rail = document.querySelector(".discount-rail");
    const railH = rail?.getBoundingClientRect().height ?? 0;
    const topInset = -(header + railH + 12);
    const bottomInset = -(window.innerHeight * 0.42);

    const observer = new IntersectionObserver(
      (entries) => {
        let infoRatio = 0;
        let applyRatio = 0;
        for (const entry of entries) {
          if (entry.target === info) infoRatio = entry.intersectionRatio;
          if (entry.target === apply) applyRatio = entry.intersectionRatio;
        }
        if (applyRatio > infoRatio && applyRatio > 0.08) {
          setTab("apply");
        } else if (infoRatio >= applyRatio) {
          setTab("info");
        }
      },
      {
        root: null,
        rootMargin: `${topInset}px 0px ${bottomInset}px 0px`,
        threshold: [0, 0.08, 0.2, 0.45, 0.7],
      },
    );

    observer.observe(info);
    observer.observe(apply);
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="discount-rail" aria-label="할인 페이지 단축 이동">
      <div className="discount-rail__inner wrap">
        {statusNote ? (
          <p
            className={`discount-rail__status${accepting ? " is-ok" : " is-warn"}`}
            role="status"
          >
            <span className="discount-rail__dot" aria-hidden />
            <span className="discount-rail__status-text">{statusNote}</span>
          </p>
        ) : (
          <p className="discount-rail__status is-muted">
            <span className="discount-rail__dot" aria-hidden />
            <span className="discount-rail__status-text">할인 링크 전용 접수</span>
          </p>
        )}
        <div className="discount-rail__tabs" role="tablist" aria-label="할인 안내·신청">
          <button
            type="button"
            role="tab"
            id="discount-tab-info"
            className="discount-rail__tab"
            aria-selected={tab === "info"}
            aria-controls="discount-info"
            onClick={() => go("info")}
          >
            할인 안내
          </button>
          <button
            type="button"
            role="tab"
            id="discount-tab-apply"
            className="discount-rail__tab"
            aria-selected={tab === "apply"}
            aria-controls="discount-apply"
            onClick={() => go("apply")}
          >
            참가 신청
          </button>
        </div>
      </div>
    </nav>
  );
}
