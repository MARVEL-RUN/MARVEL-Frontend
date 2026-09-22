import { mainFetch } from "@/lib/main/fetch";
import type { RegistrationOptionsResponse } from "./types";

const OPTIONS_TIMEOUT_MS = 12_000;

export async function fetchRegistrationOptions(eventId: string) {
  return mainFetch<RegistrationOptionsResponse>(
    `v1/public/events/${encodeURIComponent(eventId)}/registration-options`,
    { signal: AbortSignal.timeout(OPTIONS_TIMEOUT_MS) },
  );
}
