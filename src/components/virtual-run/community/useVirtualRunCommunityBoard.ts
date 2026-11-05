"use client";

import { VIRTUAL_RUN_EVENT_ID } from "@/lib/main/config";
import type { VirtualRunCommunityBoardOptions } from "@/lib/virtual-run/community";
import { VirtualRunSideBanner } from "../layout/VirtualRunSideBanner";
import { useVrPath } from "../layout/VrLink";

export function useVirtualRunCommunityBoard(): VirtualRunCommunityBoardOptions & {
  Banner: typeof VirtualRunSideBanner;
} {
  const toHref = useVrPath();
  return {
    eventId: VIRTUAL_RUN_EVENT_ID || undefined,
    toHref,
    Banner: VirtualRunSideBanner,
  };
}
