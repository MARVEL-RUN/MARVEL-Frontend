import { normalizePriceOption } from "@/lib/discount-link/normalize";
import type {
  RegistrationCategory,
  RegistrationOptionsResponse,
  RegistrationStartGroup,
  RegistrationSouvenir,
} from "@/services/main/types";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asText(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function normalizeSouvenir(raw: unknown): RegistrationSouvenir | null {
  const row = asRecord(raw);
  if (!row) return null;
  const souvenirId = asText(row.souvenirId);
  if (!souvenirId) return null;
  const sizes = Array.isArray(row.sizes)
    ? row.sizes.map((size) => asText(size)).filter(Boolean)
    : [];
  return {
    order: typeof row.order === "number" ? row.order : 0,
    souvenirId,
    name: asText(row.name),
    sizes,
  };
}

function normalizeStartGroup(raw: unknown): RegistrationStartGroup | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = asText(row.id);
  if (!id) return null;
  return {
    id,
    code: asText(row.code),
    description: asText(row.description),
  };
}

function normalizeCategory(raw: unknown): RegistrationCategory | null {
  const row = asRecord(raw);
  if (!row) return null;
  const categoryId = asText(row.categoryId);
  if (!categoryId) return null;
  const souvenirs = Array.isArray(row.souvenirs)
    ? row.souvenirs
        .map(normalizeSouvenir)
        .filter((item): item is RegistrationSouvenir => item !== null)
    : [];
  const startGroups = Array.isArray(row.startGroups)
    ? row.startGroups
        .map(normalizeStartGroup)
        .filter((item): item is RegistrationStartGroup => item !== null)
    : [];
  const pricingRow = asRecord(row.pricing);
  const serviceRaw = pricingRow?.serviceDiscountOptions;
  const serviceDiscountOptions = Array.isArray(serviceRaw)
    ? serviceRaw
        .map(normalizePriceOption)
        .filter((item): item is NonNullable<ReturnType<typeof normalizePriceOption>> => item !== null)
    : [];
  return {
    order: typeof row.order === "number" ? row.order : 0,
    categoryId,
    distance: asText(row.distance),
    categoryName: asText(row.categoryName),
    isActive: row.isActive !== false,
    amount: typeof row.amount === "number" ? row.amount : 0,
    souvenirs,
    ...(startGroups.length ? { startGroups } : {}),
    ...(serviceDiscountOptions.length
      ? { pricing: { serviceDiscountOptions } }
      : {}),
  };
}

function normalizeReason(raw: unknown) {
  const row = asRecord(raw);
  if (!row) return null;
  const code = asText(row.code);
  const message = asText(row.message);
  if (!code && !message) return null;
  return { code, message };
}

export function normalizeRegistrationOptions(
  data: RegistrationOptionsResponse,
): RegistrationOptionsResponse {
  const categories = Array.isArray(data.categories)
    ? data.categories
        .map(normalizeCategory)
        .filter((item): item is RegistrationCategory => item !== null)
    : [];
  const registrationAllowed =
    typeof data.registrationAllowed === "boolean" ? data.registrationAllowed : undefined;
  const registrationReason =
    data.registrationReason === null
      ? null
      : normalizeReason(data.registrationReason) ?? undefined;
  return {
    categories,
    ...(registrationAllowed !== undefined ? { registrationAllowed } : {}),
    ...(registrationReason !== undefined ? { registrationReason } : {}),
  };
}
