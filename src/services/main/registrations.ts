import { mainFetch } from "@/lib/main/fetch";
import type {
  RegistrationCreateRequest,
  RegistrationCreateResponse,
} from "./types";

export async function createRegistration(
  eventId: string,
  body: RegistrationCreateRequest,
) {
  return mainFetch<RegistrationCreateResponse>(
    `public/events/${encodeURIComponent(eventId)}/registrations`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}
