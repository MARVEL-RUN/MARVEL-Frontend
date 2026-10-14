"use client";

import { useEffect, useRef } from "react";

export type FlowResetTarget = "register" | "lookup";

const FLOW_RESET_EVENT = "main:flow-reset";

function trimPath(path: string) {
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

/** 같은 경로 Link는 다시 마운트되지 않아 단계가 남음 */
export function resetFlowIfCurrent(href: string, target: FlowResetTarget) {
  if (trimPath(window.location.pathname) !== trimPath(href.split(/[?#]/)[0])) return;
  window.dispatchEvent(new CustomEvent<FlowResetTarget>(FLOW_RESET_EVENT, { detail: target }));
}

export function useFlowReset(target: FlowResetTarget, onReset: () => void) {
  const handler = useRef(onReset);
  handler.current = onReset;

  useEffect(() => {
    const listener = (event: Event) => {
      if ((event as CustomEvent<FlowResetTarget>).detail === target) handler.current();
    };
    window.addEventListener(FLOW_RESET_EVENT, listener);
    return () => window.removeEventListener(FLOW_RESET_EVENT, listener);
  }, [target]);
}
