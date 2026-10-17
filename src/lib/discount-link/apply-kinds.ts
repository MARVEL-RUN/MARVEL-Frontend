import type { ApplyKind } from "@/lib/register";
import type { DiscountApplicationType } from "./types";

export function applyKindsFromDiscount(
  applicationType: DiscountApplicationType | undefined,
): ApplyKind[] {
  if (applicationType === "PERSONAL") return ["individual"];
  if (applicationType === "ORGANIZATION") return ["group"];
  return ["individual", "group"];
}
