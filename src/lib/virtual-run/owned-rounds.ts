import {
  findCategory,
  packageChildCategories,
} from "@/lib/registration-options";
import type { RegistrationCategory } from "@/services/main/types";
import { VIRTUAL_RUN_ROUNDS, type VirtualRunRoundId } from "./rounds";

function roundIdForCategory(category: {
  categoryId: string;
  categoryName: string;
}): VirtualRunRoundId | null {
  const text = `${category.categoryId} ${category.categoryName}`.toLowerCase();
  const name = category.categoryName;
  if (text.includes("avenger") || name.includes("어벤")) return "avengers";
  if (text.includes("xmen") || text.includes("x-men") || name.includes("엑스")) return "x-men";
  if (text.includes("fantastic") || name.includes("판타")) return "fantastic-four";
  return null;
}

function inRoundOrder(ids: VirtualRunRoundId[]) {
  return VIRTUAL_RUN_ROUNDS.map((round) => round.id).filter((id) => ids.includes(id));
}

/** 조회 종목과 신청 옵션으로 보유 회차. 패키지는 하위 종목 전부, 단품은 그 종목만 */
export function ownedRoundIdsForCategory(
  categories: RegistrationCategory[],
  eventCategoryId: string,
): VirtualRunRoundId[] {
  const category = findCategory(categories, eventCategoryId);
  if (!category) return [];
  const children = packageChildCategories(categories, category.categoryId);
  const targets = category.productType === "PACKAGE" || children.length > 0 ? children : [category];
  const owned: VirtualRunRoundId[] = [];
  const unmatched: RegistrationCategory[] = [];
  for (const item of targets) {
    const id = roundIdForCategory(item);
    if (id && !owned.includes(id)) owned.push(id);
    else if (!id) unmatched.push(item);
  }
  if (targets.length === VIRTUAL_RUN_ROUNDS.length) {
    const left = VIRTUAL_RUN_ROUNDS.map((round) => round.id).filter((id) => !owned.includes(id));
    unmatched.forEach((_, index) => {
      const id = left[index];
      if (id) owned.push(id);
    });
  }
  return inRoundOrder(owned);
}
