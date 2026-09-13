import { mainFetch } from "@/lib/main/fetch";
import type { RegistrationOptionsResponse } from "./types";

export async function fetchRegistrationOptions(eventId: string) {
  return mainFetch<RegistrationOptionsResponse>(
    `public/events/${encodeURIComponent(eventId)}/registration-options`,
  );
}
