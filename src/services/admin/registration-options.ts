import { adminFetch } from "@/lib/admin/fetch";
import { normalizeRegistrationOptions } from "@/lib/registration-options-normalize";
import type { RegistrationOptionsResponse } from "@/services/main/types";

const OPTIONS_TIMEOUT_MS = 12_000;

export async function fetchAdminRegistrationOptions(eventId: string) {
  const data = await adminFetch<RegistrationOptionsResponse>(
    `v1/admin/events/${encodeURIComponent(eventId)}/registration-options`,
    { signal: AbortSignal.timeout(OPTIONS_TIMEOUT_MS) },
  );
  return normalizeRegistrationOptions(data);
}
