"use client";

import { InquiryPage } from "@/components/main/inquiry/InquiryPage";
import { VIRTUAL_RUN_EVENT_ID } from "@/lib/main/config";
import { useVirtualRunCommunityBoard } from "../useVirtualRunCommunityBoard";

export function VirtualRunInquiryPage() {
  const board = useVirtualRunCommunityBoard();
  return <InquiryPage {...board} eventId={VIRTUAL_RUN_EVENT_ID} />;
}
