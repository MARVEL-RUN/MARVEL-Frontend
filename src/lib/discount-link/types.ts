export type DiscountLinkStatus = "AVAILABLE" | "NOT_STARTED" | "EXPIRED";

export type DiscountApplicationType = "PERSONAL" | "ORGANIZATION" | "BOTH";

export type PriceOptionScenario = "STANDARD" | "AGE_CONDITION";

export type AppliedDiscountStage = "INTERNAL" | "EXTERNAL";

export type AppliedDiscountMethod = "FIXED_PRICE" | "PERCENT";

export type AppliedDiscount = {
  policyId: string;
  revision: number;
  stage: AppliedDiscountStage;
  method: AppliedDiscountMethod;
  ratePercent: number | null;
  fixedAmount: number | null;
  amountBefore: number;
  amountAfter: number;
  reductionAmount: number;
};

export type PriceOption = {
  scenario: PriceOptionScenario;
  description: string;
  applicationType: "PERSONAL" | "ORGANIZATION";
  baseAmount: number;
  finalAmount: number;
  roundingAdjustmentAmount: number;
  appliedDiscounts: AppliedDiscount[];
};

export type DiscountOptionsCategory = {
  categoryId: string;
  linkDiscountApplicable: boolean;
  priceOptions: PriceOption[];
};

export type DiscountOptions = {
  linkStatus: DiscountLinkStatus;
  message: string;
  applicationType: DiscountApplicationType;
  minimumGroupSize: number | null;
  acquisitionStartsAt: string;
  acquisitionEndsAt: string;
  applicantEligibility: "NOT_EVALUATED";
  categories: DiscountOptionsCategory[];
};

export type PriceCalculation = {
  baseAmount: number;
  finalAmount: number;
  roundingAdjustmentAmount: number;
  appliedDiscounts: AppliedDiscount[];
};

export type ReferenceFilter = {
  id: string;
  code: string;
  displayName: string;
  priority: number;
  sortOrder: number;
};
