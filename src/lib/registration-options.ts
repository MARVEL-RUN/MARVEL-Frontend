import type {
  RegistrationCategory,
  RegistrationSouvenir,
} from "@/services/main/types";

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
