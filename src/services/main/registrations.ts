import { mainFetch } from "@/lib/main/fetch";
import type {
  IndividualRegistrationLookupRequest,
  IndividualRegistrationModifyRequest,
  OrganizationLookupRequest,
  OrganizationRegistrationModifyRequest,
  OrganizationRegistrationRequest,
  OrganizationRegistrationResponse,
  PaymentRetryResponse,
  RegistrationCreateRequest,
  RegistrationCreateResponse,
  RegistrationReceipt,
  RegistrationSettlementResult,
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

export type OrganizationDuplicateCheckResult = {
  requestedGroupName: string;
  useableGroupName: boolean;
  requestedLoginId: string;
  useableLoginId: boolean;
};

export async function checkOrganizationDuplicateId(
  eventId: string,
  params: { groupName: string; groupLoginId: string },
) {
  const query = new URLSearchParams({
    groupName: params.groupName.trim(),
    groupLoginId: params.groupLoginId.trim(),
  });
  return mainFetch<OrganizationDuplicateCheckResult>(
    `v1/public/events/${encodeURIComponent(eventId)}/registrations/organization/duplicate-id-check?${query}`,
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

export async function modifyIndividualRegistration(
  eventId: string,
  registrationId: string,
  body: IndividualRegistrationModifyRequest,
) {
  return mainFetch<RegistrationSettlementResult>(
    `v1/public/events/${encodeURIComponent(eventId)}/registrations/${encodeURIComponent(registrationId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );
}

export async function cancelIndividualRegistration(
  eventId: string,
  registrationId: string,
  body: IndividualRegistrationLookupRequest,
) {
  return mainFetch<RegistrationSettlementResult>(
    `v1/public/events/${encodeURIComponent(eventId)}/registrations/${encodeURIComponent(registrationId)}/cancellation`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

export async function modifyOrganizationRegistration(
  eventId: string,
  organizationId: string,
  body: OrganizationRegistrationModifyRequest,
) {
  return mainFetch<RegistrationSettlementResult>(
    `v1/public/events/${encodeURIComponent(eventId)}/organizations/${encodeURIComponent(organizationId)}/registrations`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );
}

export async function cancelOrganizationRegistration(
  eventId: string,
  organizationId: string,
  body: OrganizationLookupRequest,
) {
  return mainFetch<RegistrationSettlementResult>(
    `v1/public/events/${encodeURIComponent(eventId)}/organizations/${encodeURIComponent(organizationId)}/cancellation`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}
