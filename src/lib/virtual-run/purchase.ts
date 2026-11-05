import { formatAddressForApi } from "@/lib/daumPostcode";
import { birthToApi, genderToApi, phoneDigits } from "@/lib/payment/map";
import { shirtSouvenir } from "@/lib/registration-options";
import {
  applicationPasswordError,
  filterNoSpaceName,
  needsGuardian,
  termsAgreementFields,
  type Consents,
  type Gender,
} from "@/lib/register";
import type {
  RegistrationCategory,
  RegistrationCreateRequest,
  RegistrationEntryInput,
} from "@/services/main/types";

export type VirtualRunPersonDraft = {
  name: string;
  phone: string;
  birth: string;
  gender: Gender | "";
};

export type VirtualRunBuyerDraft = VirtualRunPersonDraft & {
  password: string;
  zonecode: string;
  address: string;
  addressDetail: string;
  guardianName: string;
  guardianPhone: string;
  guardianRelation: string;
  guardianConsent: boolean;
};

export type VirtualRunRecipientDraft = VirtualRunPersonDraft & {
  eventCategoryId: string;
};

function personFields(label: string, person: VirtualRunPersonDraft) {
  const name = filterNoSpaceName(person.name);
  if (!name) throw new Error(`${label} 이름을 입력하세요.`);
  if (name.length > 50) throw new Error(`${label} 이름은 50자까지 입력할 수 있습니다.`);
  const phNum = phoneDigits(person.phone);
  if (phNum.length < 10 || phNum.length > 14) {
    throw new Error(`${label} 휴대폰 번호를 확인하세요.`);
  }
  if (!/^\d{8}$/.test(person.birth)) throw new Error(`${label} 생년월일을 입력하세요.`);
  if (person.gender !== "male" && person.gender !== "female") {
    throw new Error(`${label} 성별을 선택하세요.`);
  }
  return {
    name,
    phNum,
    birth: birthToApi(person.birth),
    gender: genderToApi(person.gender),
  };
}

export function toPackageUpgradeEntries(
  recipients: VirtualRunRecipientDraft[],
): RegistrationEntryInput[] {
  if (!recipients.length) throw new Error("추가할 참가자가 없습니다.");
  return recipients.map((recipient, index) => {
    const fields = personFields(recipient.name.trim() || `참가자 ${index + 1}`, recipient);
    return { eventCategoryId: recipient.eventCategoryId, ...fields };
  });
}

export function toVirtualRunCreateRequest(input: {
  category: RegistrationCategory;
  buyer: VirtualRunBuyerDraft;
  recipients: VirtualRunRecipientDraft[];
  addressRequired: boolean;
  consents: Consents;
  selectedSize: string;
}): RegistrationCreateRequest {
  const { category, buyer } = input;
  if (category.productType === "OPTION") {
    throw new Error("옵션 상품은 단독으로 구매할 수 없습니다.");
  }
  if (category.productType !== "SINGLE" && category.productType !== "PACKAGE") {
    throw new Error("구매할 수 있는 상품이 아닙니다.");
  }

  const passwordError = applicationPasswordError(buyer.password);
  if (passwordError) throw new Error(passwordError);
  const applicant = personFields("신청자", buyer);

  if (input.addressRequired && !buyer.address.trim()) {
    throw new Error("배송 주소를 입력하세요.");
  }

  const births = [buyer.birth];
  let entries: RegistrationEntryInput[] | undefined;
  if (category.productType === "PACKAGE") {
    if (!input.recipients.length) {
      throw new Error("패키지 하위 종목이 없습니다.");
    }
    entries = input.recipients.map((recipient, index) => {
      const fields = personFields(`참가자 ${index + 1}`, recipient);
      births.push(recipient.birth);
      return { eventCategoryId: recipient.eventCategoryId, ...fields };
    });
  }

  const needGuardian = births.some((birth) => needsGuardian(birth));
  const guardianName = filterNoSpaceName(buyer.guardianName);
  if (needGuardian && !guardianName) {
    throw new Error("만 14세 미만 참가자의 보호자 이름을 입력하세요.");
  }
  if (needGuardian && !buyer.guardianConsent) {
    throw new Error("만 14세 미만 참가자에 대한 보호자 동의가 필요합니다.");
  }

  const souvenir = shirtSouvenir(category);
  const sizes = (souvenir?.sizes ?? []).map((size) => size.trim()).filter(Boolean);
  const selectedSize =
    input.selectedSize.trim() || (sizes.length === 1 ? sizes[0] : "");
  if (souvenir && sizes.length && !sizes.includes(selectedSize)) {
    throw new Error("키트 옵션을 선택하세요.");
  }
  const selectedSouvenirList =
    souvenir && selectedSize
      ? [{ souvenirId: souvenir.souvenirId, selectedSize }]
      : [];

  const guardianPhone = phoneDigits(buyer.guardianPhone);
  return {
    eventCategoryId: category.categoryId,
    selectedSouvenirList,
    password: buyer.password.trim(),
    ...applicant,
    address: formatAddressForApi(buyer.zonecode.trim(), buyer.address.trim()),
    addressDetail: buyer.addressDetail.trim(),
    ...(guardianName ? { guardianName } : {}),
    ...(guardianPhone ? { guardianPhNum: guardianPhone } : {}),
    ...(buyer.guardianRelation.trim()
      ? { guardianRelationship: buyer.guardianRelation.trim() }
      : {}),
    guardianConsent: needGuardian ? buyer.guardianConsent : false,
    ...termsAgreementFields(input.consents),
    startGroupId: null,
    startGroupUnselected: true,
    ...(entries ? { entries } : {}),
  };
}
