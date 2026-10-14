import { normalizeRegistrationOptions } from "@/lib/registration-options-normalize";
import { mainFetch } from "@/lib/main/fetch";
import type { RegistrationOptionsResponse } from "./types";

const OPTIONS_TIMEOUT_MS = 12_000;

export async function fetchRegistrationOptions(eventId: string) {
  const data = await mainFetch<RegistrationOptionsResponse>(
    `v1/public/events/${encodeURIComponent(eventId)}/registration-options`,
    { signal: AbortSignal.timeout(OPTIONS_TIMEOUT_MS) },
  );
  return normalizeRegistrationOptions(data);
}
