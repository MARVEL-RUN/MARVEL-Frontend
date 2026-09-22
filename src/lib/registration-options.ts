import type {
  RegistrationCategory,
  RegistrationSouvenir,
} from "@/services/main/types";
import { EVENT } from "./event";
import {
  ageBand,
  courseAllowsChild,
  feeAmount,
  shirtSizesForTicket,
  ticketFee,
  ticketForBirth,
  type CourseId,
  type GroupDraft,
  type TicketKind,
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

export function findCategoryByLabel(
  categories: RegistrationCategory[],
  label: string,
) {
  const key = label.trim();
  if (!key) return undefined;
  return categories.find(
    (item) =>
      item.categoryId === key ||
      item.categoryName === key ||
      item.distance === key ||
      categoryLabel(item) === key ||
      `${item.distance} ${item.categoryName}`.trim() === key,
  );
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

export function shirtSouvenir(category: RegistrationCategory | undefined) {
  const items = sortedSouvenirs(category);
  if (!items.length) return undefined;
  return items.find((item) => /티셔츠|t-?shirt/i.test(item.name)) ?? items[0];
}

export function shirtAssignment(
  category: RegistrationCategory | undefined,
  selectedSize = "",
  birth = "",
) {
  const souvenir = shirtSouvenir(category);
  if (!souvenir) return { souvenirId: "", selectedSize: "" };
  const ticket = birth ? ticketForBirth(birth) : "adult";
  const sizes = souvenirSizes(souvenir, ticket);
  const keep = sizes.includes(selectedSize) ? selectedSize : "";
  return {
    souvenirId: souvenir.souvenirId,
    selectedSize: keep || (sizes.length === 1 ? sizes[0] : ""),
  };
}

export function categoryLabel(category: RegistrationCategory) {
  const parts = [category.distance, category.categoryName].filter(Boolean);
  const unique = parts.filter((part, i) => parts.indexOf(part) === i);
  return unique.join(" / ") || category.categoryId;
}

export function souvenirSizes(
  souvenir: RegistrationSouvenir | undefined,
  ticket: TicketKind = "adult",
): string[] {
  const allowed = shirtSizesForTicket(ticket);
  const sizes = souvenir?.sizes ?? [];
  if (!sizes.length) return allowed;
  const hit = allowed.filter((size) => sizes.includes(size));
  return hit.length ? hit : allowed;
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

export function categoryForCourse(
  categories: RegistrationCategory[],
  courseId: CourseId,
  birth: string,
) {
  return sortedCategories(categories).find((category) => {
    const course = courseForCategory(category);
    if (!course || course.id !== courseId) return false;
    if (category.isActive === false) return false;
    return categoryOpenForBirth(category, birth);
  });
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
  if (band === "tooYoung") return "대회일 이후 출생";
  if (band === "child") return "만 12세 이하 참가 불가";
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
