import {
  packageChildCategories,
  purchasableProductCategories,
} from "@/lib/registration-options";
import type { VrPackageId } from "@/lib/virtual-run/packages";
import type { VirtualRunRoundId } from "@/lib/virtual-run/rounds";
import type { RegistrationCategory } from "@/services/main/types";

const ROUND_NEEDLES: Record<VirtualRunRoundId, string[]> = {
  avengers: ["avenger", "어벤"],
  "x-men": ["x-men", "xmen", "엑스"],
  "fantastic-four": ["fantastic", "판타"],
};

export function matchesVirtualRunRound(
  category: RegistrationCategory,
  roundId: VirtualRunRoundId,
) {
  const text = `${category.categoryId} ${category.categoryName}`.toLowerCase();
  return ROUND_NEEDLES[roundId].some(
    (needle) => text.includes(needle.toLowerCase()) || category.categoryName.includes(needle),
  );
}

export function virtualRunProductForPackage(
  categories: RegistrationCategory[],
  packageId: VrPackageId,
) {
  const products = purchasableProductCategories(categories);
  if (packageId === "assemble") {
    return products.find((category) => category.productType === "PACKAGE");
  }
  return products.find(
    (category) =>
      category.productType === "SINGLE" && matchesVirtualRunRound(category, packageId),
  );
}

export function virtualRunEntryCategory(
  categories: RegistrationCategory[],
  product: RegistrationCategory,
  roundId: VirtualRunRoundId,
) {
  if (product.productType === "SINGLE") return product;
  return packageChildCategories(categories, product.categoryId).find((category) =>
    matchesVirtualRunRound(category, roundId),
  );
}
