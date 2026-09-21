import { mainFetch } from "@/lib/main/fetch";
import type {
  IndividualRegistrationLookupRequest,
  OrganizationLookupRequest,
  OrganizationRegistrationRequest,
  OrganizationRegistrationResponse,
  PaymentRetryResponse,
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

export async function retryIndividualPayment(
  eventId: string,
  registrationId: string,
  paymentId: string,
  body: IndividualRegistrationLookupRequest,
) {
  return mainFetch<PaymentRetryResponse>(
    `v1/public/events/${encodeURIComponent(eventId)}/registrations/${encodeURIComponent(registrationId)}/payments/${encodeURIComponent(paymentId)}/retry`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

export async function retryOrganizationPayment(
  eventId: string,
  organizationId: string,
  paymentId: string,
  body: OrganizationLookupRequest,
) {
  return mainFetch<PaymentRetryResponse>(
    `v1/public/events/${encodeURIComponent(eventId)}/organizations/${encodeURIComponent(organizationId)}/payments/${encodeURIComponent(paymentId)}/retry`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}
