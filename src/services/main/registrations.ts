import { mainFetch } from "@/lib/main/fetch";
import type {
  IndividualRegistrationLookupRequest,
  OrganizationLookupRequest,
  OrganizationRegistrationRequest,
  OrganizationRegistrationResponse,
  RegistrationCreateRequest,
  RegistrationCreateResponse,
  RegistrationReceipt,
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

export async function lookupIndividualRegistrations(
  eventId: string,
  body: IndividualRegistrationLookupRequest,
) {
  return mainFetch<RegistrationReceipt[]>(
    `v1/public/events/${encodeURIComponent(eventId)}/registrations/lookup`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

export async function lookupOrganizationRegistrations(
  eventId: string,
  body: OrganizationLookupRequest,
) {
  return mainFetch<RegistrationReceipt[]>(
    `v1/public/events/${encodeURIComponent(eventId)}/organizations/lookup`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}
