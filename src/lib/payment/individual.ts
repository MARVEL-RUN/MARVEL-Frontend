import { formatAddressForApi } from "@/lib/daumPostcode";
import {
  categoryForCourse,
  shirtSouvenir,
  souvenirSizes,
} from "@/lib/registration-options";
import {
  guardianRequiredFor,
  termsAgreementFields,
  type EntryDraft,
} from "@/lib/register";
import type {
  RegistrationCategory,
  RegistrationCreateRequest,
} from "@/services/main/types";
import { birthToApi, genderToApi, phoneDigits } from "./map";

export function toRegistrationCreateRequest(
  draft: EntryDraft,
  categories: RegistrationCategory[],
): RegistrationCreateRequest {
  const courseId = draft.courseId;
  if (!courseId) throw new Error("참가종목을 선택하세요.");
  if (draft.gender !== "male" && draft.gender !== "female") {
    throw new Error("성별을 선택하세요.");
  }

  const category = categoryForCourse(categories, courseId, draft.birth);
  if (!category) throw new Error("선택한 종목을 신청할 수 없습니다.");

  const souvenir = shirtSouvenir(category);
  const size = draft.selectedSize.trim();
  if (!souvenir) throw new Error("티셔츠 옵션을 불러오지 못했습니다.");
  if (!size || !souvenirSizes(souvenir, draft.ticket).includes(size)) {
    throw new Error("티셔츠 사이즈를 선택하세요.");
  }

  const guardianName = draft.guardianName.trim();
  const guardianPhone = phoneDigits(draft.guardianPhone);
  const guardianRelation = draft.guardianRelation.trim();
  const requireGuardian = guardianRequiredFor(draft);

  return {
    eventCategoryId: category.categoryId,
    selectedSouvenirList: [
      { souvenirId: souvenir.souvenirId, selectedSize: size },
    ],
    password: (draft.password ?? "").trim(),
    name: draft.name.trim(),
    phNum: phoneDigits(draft.phone),
    birth: birthToApi(draft.birth),
    gender: genderToApi(draft.gender),
    address: formatAddressForApi(
      (draft.zonecode ?? "").trim(),
      (draft.address ?? "").trim(),
    ),
    addressDetail: (draft.addressDetail ?? "").trim(),
    ...(guardianName ? { guardianName } : {}),
    ...(guardianPhone ? { guardianPhone } : {}),
    ...(guardianRelation ? { guardianRelationship: guardianRelation } : {}),
    guardianConsent: requireGuardian ? draft.guardianConsent : false,
    ...termsAgreementFields(draft),
  };
}
