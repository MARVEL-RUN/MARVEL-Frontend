"use client";

import { X } from "lucide-react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { RegisterRound2HintContent } from "./RegisterRound2HintContent";
import { useRound2OpenCountdown } from "./useRegistrationRound2Pause";

type Props = {
  open: boolean;
  onClose: () => void;
  anchorRef?: RefObject<HTMLElement | null>;
};

type Layout = {
  top: number;
  left: number;
  placement: "above" | "below";
  tail: number;
};

const GAP = 14;
const EDGE = 12;
const TAIL_INSET = 22;

function siteZoom() {
  const z = Number.parseFloat(getComputedStyle(document.documentElement).zoom);
  return z > 0 ? z : 1;
}

/* html zoom 때문에 rect·viewport를 zoom으로 나눠야 fixed 좌표와 맞는다 */
function layoutTip(anchor: HTMLElement, panel: HTMLElement): Layout {
  const z = siteZoom();
  const target = (anchor.firstElementChild as HTMLElement | null) ?? anchor;
  const r = target.getBoundingClientRect();
  const top = r.top / z;
  const bottom = r.bottom / z;
  const cx = (r.left + r.width / 2) / z;
  const vw = window.innerWidth / z;
  const vh = window.innerHeight / z;
  const w = panel.offsetWidth;
  const h = panel.offsetHeight;

  const spaceBelow = vh - bottom - GAP - EDGE;
  const spaceAbove = top - GAP - EDGE;
  const placement = spaceBelow >= h || spaceBelow >= spaceAbove ? "below" : "above";

  const left = Math.min(Math.max(EDGE, cx - w / 2), Math.max(EDGE, vw - w - EDGE));
  const tail = Math.min(w - TAIL_INSET, Math.max(TAIL_INSET, cx - left));

  return {
    top: placement === "below" ? bottom + GAP : top - GAP - h,
    left,
    placement,
    tail,
  };
}

export function RegisterRound2HintModal({ open, onClose, anchorRef }: Props) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [layout, setLayout] = useState<Layout | null>(null);
  const slots = useRound2OpenCountdown(open);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !mounted) {
      setLayout(null);
      return;
    }
    const anchor = anchorRef?.current;
    const panel = panelRef.current;
    if (!anchor || !panel) return;
    const update = () => setLayout(layoutTip(anchor, panel));
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, mounted, anchorRef]);

  useEffect(() => {
    if (open && slots === null) onClose();
  }, [open, slots, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const style: CSSProperties = layout
    ? {
        top: layout.top,
        left: layout.left,
        ["--round2-tip-tail" as string]: `${layout.tail}px`,
      }
    : { top: 0, left: 0, visibility: "hidden" };

  return createPortal(
    <div className="round2-tip-layer" role="presentation">
      <button
        type="button"
        className="round2-tip-layer__catch"
        onClick={onClose}
        aria-label="닫기"
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        className="round2-tip"
        style={style}
        data-placement={layout?.placement ?? "below"}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
      >
        <header className="round2-tip__head">
          <span className="round2-tip__kicker">2차 접수 대기</span>
          <button type="button" className="round2-tip__x" onClick={onClose} aria-label="닫기">
            <X size={16} strokeWidth={2.4} />
          </button>
        </header>
        <h2 id={titleId} className="round2-tip__title">
          1차 신청이 마감되었습니다
        </h2>
        <RegisterRound2HintContent live={open} />
        <footer className="round2-tip__foot">
          <button type="button" className="btn btn--red round2-tip__ok" onClick={onClose}>
            확인
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
