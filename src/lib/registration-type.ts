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

/** API type·registrationType → PERSONAL | ORGANIZATION */
export function registrationTypeKey(type?: string | null): RegistrationType | "" {
  const key = statusKey(type);
  if (isRegistrationType(key)) return key;
  const raw = (type ?? "").trim();
  if (raw === "단체") return "ORGANIZATION";
  if (raw === "개인") return "PERSONAL";
  if (key === "GROUP" || key === "TEAM") return "ORGANIZATION";
  return "";
}

export function kindFromRegistrationType(type?: string | null): ApplicationKind {
  return registrationTypeKey(type) === "ORGANIZATION" ? "group" : "individual";
}

export function registrationTypeFromKind(kind: ApplicationKind | ""): RegistrationType | "" {
  if (kind === "individual") return "PERSONAL";
  if (kind === "group") return "ORGANIZATION";
  return "";
}

export function registrationTypeLabel(type?: string | null) {
  const key = registrationTypeKey(type);
  if (key) return REGISTRATION_TYPE_LABEL[key];
  return type?.trim() || "-";
}
