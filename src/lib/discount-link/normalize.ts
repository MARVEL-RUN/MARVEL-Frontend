import type {
  AppliedDiscount,
  DiscountOptions,
  DiscountOptionsCategory,
  PriceOption,
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

function asNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value.replace(/,/g, "").trim());
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function asNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = asNumber(value, NaN);
  return Number.isFinite(n) ? n : null;
}

function normalizeAppliedDiscount(raw: unknown): AppliedDiscount | null {
  const row = asRecord(raw);
  if (!row) return null;
  const policyId = asText(row.policyId);
  if (!policyId) return null;
  const stage = asText(row.stage);
  const method = asText(row.method);
  if (stage !== "INTERNAL" && stage !== "EXTERNAL") return null;
  if (method !== "FIXED_PRICE" && method !== "PERCENT") return null;
  return {
    policyId,
    revision: asNumber(row.revision, 0),
    stage,
    method,
    ratePercent: asNullableNumber(row.ratePercent),
    fixedAmount: asNullableNumber(row.fixedAmount),
    amountBefore: asNumber(row.amountBefore),
    amountAfter: asNumber(row.amountAfter),
    reductionAmount: asNumber(row.reductionAmount),
  };
}

export function normalizePriceOption(raw: unknown): PriceOption | null {
  const row = asRecord(raw);
  if (!row) return null;
  const scenario = asText(row.scenario);
  const applicationType = asText(row.applicationType);
  if (scenario !== "STANDARD" && scenario !== "AGE_CONDITION") return null;
  if (applicationType !== "PERSONAL" && applicationType !== "ORGANIZATION") {
    return null;
  }
  const appliedDiscounts = Array.isArray(row.appliedDiscounts)
    ? row.appliedDiscounts
        .map(normalizeAppliedDiscount)
        .filter((item): item is AppliedDiscount => item !== null)
    : [];
  return {
    scenario,
    description: asText(row.description),
    applicationType,
    baseAmount: asNumber(row.baseAmount),
    finalAmount: asNumber(row.finalAmount),
    roundingAdjustmentAmount: asNumber(row.roundingAdjustmentAmount),
    appliedDiscounts,
  };
}

function normalizeDiscountCategory(raw: unknown): DiscountOptionsCategory | null {
  const row = asRecord(raw);
  if (!row) return null;
  const categoryId = asText(row.categoryId);
  if (!categoryId) return null;
  const priceOptions = Array.isArray(row.priceOptions)
    ? row.priceOptions
        .map(normalizePriceOption)
        .filter((item): item is PriceOption => item !== null)
    : [];
  return {
    categoryId,
    linkDiscountApplicable: row.linkDiscountApplicable === true,
    priceOptions,
  };
}

export function normalizeDiscountOptions(data: DiscountOptions): DiscountOptions {
  const linkStatusRaw = asText(data.linkStatus);
  const linkStatus =
    linkStatusRaw === "NOT_STARTED" || linkStatusRaw === "EXPIRED"
      ? linkStatusRaw
      : "AVAILABLE";
  const applicationTypeRaw = asText(data.applicationType);
  const applicationType =
    applicationTypeRaw === "PERSONAL" ||
    applicationTypeRaw === "ORGANIZATION" ||
    applicationTypeRaw === "BOTH"
      ? applicationTypeRaw
      : "BOTH";
  const categories = Array.isArray(data.categories)
    ? data.categories
        .map(normalizeDiscountCategory)
        .filter((item): item is DiscountOptionsCategory => item !== null)
    : [];
  return {
    linkStatus,
    message: asText(data.message),
    applicationType,
    minimumGroupSize: asNullableNumber(data.minimumGroupSize),
    acquisitionStartsAt: asText(data.acquisitionStartsAt),
    acquisitionEndsAt: asText(data.acquisitionEndsAt),
    applicantEligibility: "NOT_EVALUATED",
    categories,
  };
}

export function normalizePriceCalculation(raw: unknown): import("./types").PriceCalculation | null {
  const row = asRecord(raw);
  if (!row) return null;
  const appliedDiscounts = Array.isArray(row.appliedDiscounts)
    ? row.appliedDiscounts
        .map(normalizeAppliedDiscount)
        .filter((item): item is AppliedDiscount => item !== null)
    : [];
  return {
    baseAmount: asNumber(row.baseAmount),
    finalAmount: asNumber(row.finalAmount),
    roundingAdjustmentAmount: asNumber(row.roundingAdjustmentAmount),
    appliedDiscounts,
  };
}
