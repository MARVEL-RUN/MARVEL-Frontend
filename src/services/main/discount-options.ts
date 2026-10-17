import { normalizeDiscountOptions } from "@/lib/discount-link/normalize";
import type { DiscountOptions } from "@/lib/discount-link/types";
import { mainFetch } from "@/lib/main/fetch";

export function fetchDiscountOptions(eventId: string, linkCode: string) {
  const code = linkCode.trim();
  const query = new URLSearchParams({ linkCode: code });
  return mainFetch<DiscountOptions>(
    `v1/public/events/${encodeURIComponent(eventId)}/discount-options?${query}`,
  ).then(normalizeDiscountOptions);
}
