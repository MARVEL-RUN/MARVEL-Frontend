import { mainFetch } from "@/lib/main/fetch";
import type { RegistrationOptionsResponse } from "@/services/main/types";

const OPTIONS_TIMEOUT_MS = 12_000;

export function fetchAdminRegistrationOptions(eventId: string) {
  return mainFetch<RegistrationOptionsResponse>(
    `v1/public/events/${encodeURIComponent(eventId)}/registration-options`,
    { signal: AbortSignal.timeout(OPTIONS_TIMEOUT_MS) },
  );
}
