import { mainFetch } from "@/lib/main/fetch";
import type {
  IndividualRegistrationLookupRequest,
  IndividualRegistrationModifyRequest,
  OrganizationLookupParticipant,
  OrganizationLookupRequest,
  OrganizationRegistrationModifyRequest,
  OrganizationRegistrationRequest,
  OrganizationRegistrationResponse,
  PaymentRetryResponse,
  RegistrationCreateRequest,
  RegistrationCreateResponse,
  RegistrationReceipt,
  RegistrationReceiptMember,
  RegistrationSettlementResult,
} from "./types";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asText(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function firstText(...values: unknown[]) {
  for (const value of values) {
    const text = asText(value);
    if (text) return text;
  }
  return "";
}

function souvenirListFromParticipant(row: Record<string, unknown>) {
  if (Array.isArray(row.selectedSouvenirList) && row.selectedSouvenirList.length) {
    return row.selectedSouvenirList as OrganizationLookupParticipant["selectedSouvenirList"];
  }
  if (Array.isArray(row.souvenirs) && row.souvenirs.length) {
    return row.souvenirs as OrganizationLookupParticipant["selectedSouvenirList"];
  }
  const souvenirId = asText(row.souvenirId);
  const souvenirName = asText(row.souvenirName);
  const size = firstText(row.souvenirSize, row.selectedSize, row.size);
  if (!souvenirId && !souvenirName && !size) return undefined;
  return [
    {
      souvenirId: souvenirId || souvenirName,
      name: souvenirName || souvenirId,
      selectedSize: size,
      size,
      quantity: 1,
    },
  ];
}

function asLookupParticipant(raw: unknown): OrganizationLookupParticipant | null {
  const row = asRecord(raw);
  if (!row) return null;
  const registrationId = asText(row.registrationId);
  if (!registrationId) return null;
  const status = firstText(row.registrationStatus, row.status);
  return {
    registrationId,
    name: asText(row.name),
    email: asText(row.email),
    birth: asText(row.birth),
    phNum: firstText(row.phNum, row.phoneNumber, row.phone),
    phoneNumber: firstText(row.phoneNumber, row.phNum, row.phone),
    gender: asText(row.gender),
    eventCategoryId: asText(row.eventCategoryId),
    eventCategoryName: firstText(row.eventCategoryName, row.courseName),
    selectedSouvenirList: souvenirListFromParticipant(row),
    address: asText(row.address),
    addressDetail: asText(row.addressDetail),
    guardianName: asText(row.guardianName),
    guardianPhNum: firstText(row.guardianPhNum, row.guardianPhoneNumber),
    canceled: row.canceled === true || status === "CANCELED",
    registrationStatus: status,
  };
}

export function organizationLookupParticipants(
  receipt: RegistrationReceipt,
): OrganizationLookupParticipant[] {
  const source =
    receipt.registrations?.length
      ? receipt.registrations
      : receipt.members?.length
        ? receipt.members
        : [];
  return source.flatMap((item) => {
    const row = asLookupParticipant(item);
    return row ? [row] : [];
  });
}

function normalizeRegistrationReceipt(raw: unknown): RegistrationReceipt {
  const row = asRecord(raw);
  if (!row) return { totalAmount: 0, paidAmount: 0 };
  const receipt = row as RegistrationReceipt;
  const source =
    Array.isArray(receipt.registrations) && receipt.registrations.length
      ? receipt.registrations
      : Array.isArray(receipt.members) && receipt.members.length
        ? receipt.members
        : [];
  const mergedRegistrations = source.flatMap((item) => {
    const participant = asLookupParticipant(item);
    return participant ? [participant] : [];
  });
  return {
    ...receipt,
    organizationId: asText(receipt.organizationId) || null,
    organizationName:
      asText(receipt.organizationName) ||
      asText(row.groupName) ||
      asText(row.orgName) ||
      null,
    leaderName: asText(receipt.leaderName) || null,
    leaderBirth: asText(receipt.leaderBirth) || null,
    leaderPhNum: asText(receipt.leaderPhNum) || asText(row.leaderPhoneNumber) || null,
    email: asText(receipt.email) || null,
    address: asText(receipt.address) || null,
    addressDetail: asText(receipt.addressDetail) || null,
    guardianConsent:
      typeof receipt.guardianConsent === "boolean" ? receipt.guardianConsent : null,
    registrations: mergedRegistrations,
  };
}

function normalizeRegistrationReceiptList(data: unknown): RegistrationReceipt[] {
  if (Array.isArray(data)) {
    return data.map(normalizeRegistrationReceipt);
  }
  const row = asRecord(data);
  if (!row) return [];
  if (Array.isArray(row.content)) {
    return row.content.map(normalizeRegistrationReceipt);
  }
  if (row.organizationId || row.registrationId || row.registrations || row.members) {
    return [normalizeRegistrationReceipt(row)];
  }
  return [];
}

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

export type OrganizationNameDuplicateCheckResult = {
  requestValue?: string;
  requestUseable?: boolean;
  requestedGroupName?: string;
  useableGroupName?: boolean;
};

export type OrganizationIdDuplicateCheckResult = {
  requestValue?: string;
  requestUseable?: boolean;
  requestedLoginId?: string;
  useableLoginId?: boolean;
};

function readUseable(data: unknown, keys: string[]) {
  if (!data || typeof data !== "object") return true;
  const row = data as Record<string, unknown>;
  for (const key of keys) {
    if (typeof row[key] === "boolean") return row[key] as boolean;
  }
  if (typeof row.requestUseable === "boolean") return row.requestUseable;
  if (typeof row.exists === "boolean") return !row.exists;
  if (typeof row.available === "boolean") return row.available;
  if (typeof row.useable === "boolean") return row.useable;
  return true;
}

export async function checkOrganizationDuplicateName(
  eventId: string,
  groupName: string,
) {
  const query = new URLSearchParams({ groupName: groupName.trim() });
  const data = await mainFetch<OrganizationNameDuplicateCheckResult>(
    `v1/public/events/${encodeURIComponent(eventId)}/registrations/organization/duplicate-name-check?${query}`,
  );
  return {
    requestedGroupName: groupName.trim(),
    useableGroupName: readUseable(data, ["requestUseable", "useableGroupName"]),
  };
}

export async function checkOrganizationDuplicateId(
  eventId: string,
  groupLoginId: string,
) {
  const query = new URLSearchParams({ groupLoginId: groupLoginId.trim() });
  const data = await mainFetch<OrganizationIdDuplicateCheckResult>(
    `v1/public/events/${encodeURIComponent(eventId)}/registrations/organization/duplicate-id-check?${query}`,
  );
  return {
    requestedLoginId: groupLoginId.trim(),
    useableLoginId: readUseable(data, ["requestUseable", "useableLoginId"]),
  };
}

export async function lookupIndividualRegistrations(
  eventId: string,
  body: IndividualRegistrationLookupRequest,
) {
  return mainFetch<unknown>(
    `v1/public/events/${encodeURIComponent(eventId)}/registrations/lookup`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  ).then(normalizeRegistrationReceiptList);
}

export async function lookupOrganizationRegistrations(
  eventId: string,
  body: OrganizationLookupRequest,
) {
  return mainFetch<unknown>(
    `v1/public/events/${encodeURIComponent(eventId)}/organizations/lookup`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  ).then(normalizeRegistrationReceiptList);
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
