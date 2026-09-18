import { MainHttpError, mainFetch } from "@/lib/main/fetch";
import type { RegistrationOptionsResponse } from "./types";

export async function fetchRegistrationOptions(eventId: string) {
  const path = `v1/public/events/${encodeURIComponent(eventId)}/registration-options`;
  try {
    return await mainFetch<RegistrationOptionsResponse>(path);
  } catch (err) {
    if (err instanceof MainHttpError && err.status >= 400) throw err;
    return mainFetch<RegistrationOptionsResponse>(path);
  }
}
