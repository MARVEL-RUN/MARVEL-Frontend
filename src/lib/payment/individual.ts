import { formatAddressForApi } from "@/lib/daumPostcode";
import {
  categoryForCourse,
  shirtSouvenir,
  souvenirSizes,
} from "@/lib/registration-options";
import type { EntryDraft } from "@/lib/register";
import type {
  RegistrationCategory,
  RegistrationCreateRequest,
} from "@/services/main/types";
import { genderToApi, phoneDigits } from "./map";

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
  const size = draft.shirt.trim();
  if (!souvenir) throw new Error("기념품을 선택하세요.");
  if (!size || !souvenirSizes(souvenir).includes(size)) {
    throw new Error("기념품 사이즈를 선택하세요.");
  }

  return {
    eventCategoryId: category.categoryId,
    selectedSouvenirList: [
      { souvenirId: souvenir.souvenirId, selectedSize: size },
    ],
    password: (draft.password ?? "").trim(),
    name: draft.name.trim(),
    phNum: phoneDigits(draft.phone),
    birth: draft.birth,
    gender: genderToApi(draft.gender),
    address: formatAddressForApi(
      (draft.zonecode ?? "").trim(),
      (draft.address ?? "").trim(),
    ),
    addressDetail: (draft.addressDetail ?? "").trim(),
  };
}
