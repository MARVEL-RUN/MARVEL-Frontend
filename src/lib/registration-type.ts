import { statusKey } from "@/lib/registration-status";

export const REGISTRATION_TYPES = ["PERSONAL", "ORGANIZATION"] as const;

export type RegistrationType = (typeof REGISTRATION_TYPES)[number];

export const REGISTRATION_TYPE_LABEL: Record<RegistrationType, string> = {
  PERSONAL: "개인",
  ORGANIZATION: "단체",
};

export type ApplicationKind = "individual" | "group";

export function isRegistrationType(value: string): value is RegistrationType {
  return REGISTRATION_TYPES.includes(value as RegistrationType);
}

export function kindFromRegistrationType(type?: string | null): ApplicationKind {
  return statusKey(type) === "ORGANIZATION" ? "group" : "individual";
}

export function registrationTypeFromKind(kind: ApplicationKind | ""): RegistrationType | "" {
  if (kind === "individual") return "PERSONAL";
  if (kind === "group") return "ORGANIZATION";
  return "";
}

export function registrationTypeLabel(type?: string | null) {
  const key = statusKey(type);
  if (isRegistrationType(key)) return REGISTRATION_TYPE_LABEL[key];
  return type?.trim() || "-";
}
