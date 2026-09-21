import { mainFetch } from "@/lib/main/fetch";
import type {
  OrganizationRegistrationRequest,
  OrganizationRegistrationResponse,
  RegistrationCreateRequest,
  RegistrationCreateResponse,
} from "./types";

export async function createRegistration(
  eventId: string,
  body: RegistrationCreateRequest,
) {
  return mainFetch<RegistrationCreateResponse>(
    `v1/public/events/${encodeURIComponent(eventId)}/registrations`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

export async function createOrganizationRegistration(
  eventId: string,
  body: OrganizationRegistrationRequest,
) {
  return mainFetch<OrganizationRegistrationResponse>(
    `v1/public/events/${encodeURIComponent(eventId)}/registrations/organization`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}
