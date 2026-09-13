import type {
  RegistrationCategory,
  RegistrationSouvenir,
} from "@/services/main/types";
import { EVENT } from "./event";
import {
  ageBand,
  courseAllowsChild,
  feeAmount,
  ticketFee,
  ticketForBirth,
  type GroupDraft,
} from "./register";

export function sortedCategories(categories: RegistrationCategory[]) {
  return [...categories].sort((a, b) => a.order - b.order);
}

export function findCategory(
  categories: RegistrationCategory[],
  categoryId: string,
) {
  return categories.find((item) => item.categoryId === categoryId);
}

export function sortedSouvenirs(category: RegistrationCategory | undefined) {
  return [...(category?.souvenirs ?? [])].sort((a, b) => a.order - b.order);
}

export function findSouvenir(
  category: RegistrationCategory | undefined,
  souvenirId: string,
) {
  return category?.souvenirs.find((item) => item.souvenirId === souvenirId);
}

export function categoryLabel(category: RegistrationCategory) {
  const parts = [category.distance, category.categoryName].filter(Boolean);
  const unique = parts.filter((part, i) => parts.indexOf(part) === i);
  return unique.join(" / ") || category.categoryId;
}

export function souvenirSizes(souvenir: RegistrationSouvenir | undefined) {
  const sizes = souvenir?.sizes ?? [];
  return sizes.length ? sizes : ["FREE"];
}

function compactDistance(value: string) {
  return value.replace(/\s+/g, "").toLowerCase();
}

function categoryText(category: RegistrationCategory) {
  return `${category.distance} ${category.categoryName}`;
}

export function courseForCategory(category: RegistrationCategory) {
  const key = compactDistance(category.distance || category.categoryName || "");
  return EVENT.courses.find((c) => compactDistance(c.distance) === key);
}

export function categoryOpenForBirth(
  category: RegistrationCategory,
  birth: string,
) {
  const band = ageBand(birth);
  if (!band) return true;
  if (band === "tooYoung") return false;

  const text = categoryText(category);
  if (band === "child") {
    if (/성인/.test(text) && !/어린이/.test(text)) return false;
    const course = courseForCategory(category);
    return course ? courseAllowsChild(course) : true;
  }
  if (/어린이/.test(text) && !/성인/.test(text)) return false;
  return true;
}

export function categoryClosedReason(
  category: RegistrationCategory,
  birth: string,
) {
  const band = ageBand(birth);
  if (band === "tooYoung") return "만 6세 미만";
  if (band === "child") return "어린이 참가 불가";
  if (band && /어린이/.test(categoryText(category))) return "성인 참가 불가";
  return "";
}

export function categoryFeeAmount(
  category: RegistrationCategory,
  birth: string,
) {
  const course = courseForCategory(category);
  if (course && ticketForBirth(birth) === "child" && courseAllowsChild(course)) {
    return feeAmount(ticketFee(course, "child"));
  }
  return category.amount;
}

export function groupOptionsFee(
  draft: GroupDraft,
  categories: RegistrationCategory[],
) {
  return draft.participants.reduce((sum, p) => {
    const category = findCategory(categories, p.categoryId);
    return sum + (category ? categoryFeeAmount(category, p.birth) : 0);
  }, 0);
}
