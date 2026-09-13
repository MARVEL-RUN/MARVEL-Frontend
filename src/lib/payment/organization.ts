import { formatAddressForApi } from "@/lib/daumPostcode";
import {
  categoryFeeAmount,
  categoryLabel,
  findCategory,
  findSouvenir,
} from "@/lib/registration-options";
import { formatPhone, type GroupDraft } from "@/lib/register";
import type {
  OrganizationRegistrationRequest,
  RegistrationCategory,
} from "@/services/main/types";
import type { PaymentOrder, PaymentReceipt } from "./session";
import { genderToApi, phoneDigits } from "./map";

export function birthToIso(ymd: string) {
  if (!/^\d{8}$/.test(ymd)) throw new Error("생년월일이 올바르지 않습니다.");
  return `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
}

export function toOrganizationRegistrationRequest(
  draft: GroupDraft,
): OrganizationRegistrationRequest {
  return {
    account: {
      organizationName: draft.groupName.trim(),
      organizationAccount: draft.organizationAccount.trim(),
      organizationPassword: draft.organizationPassword.trim(),
    },
    profile: {
      address: formatAddressForApi(draft.zonecode.trim(), draft.address.trim()),
      addressDetail: draft.addressDetail.trim(),
      birth: birthToIso(draft.leaderBirth),
      phNum: formatPhone(draft.phone),
      email: draft.email.trim(),
      leaderName: draft.leaderName.trim(),
    },
    registrations: draft.participants.map((p) => ({
      eventCategoryId: p.categoryId,
      selectedSouvenirList: [
        { souvenirId: p.souvenirId, selectedSize: p.selectedSize },
      ],
      name: p.name.trim(),
      phNum: phoneDigits(p.phone),
      birth: p.birth,
      gender: genderToApi(p.gender),
    })),
  };
}

type PaymentLike = {
  orderId?: string;
  orderName?: string;
  paymentAmount?: number;
  amount?: number;
  payment?: PaymentLike;
};

export function organizationPaymentOrder(data: PaymentLike): PaymentOrder {
  const payment = data.payment ?? {};
  const orderId = data.orderId ?? payment.orderId;
  const orderName =
    data.orderName ?? payment.orderName ?? "MarvelRun 단체 참가신청";
  const paymentAmount =
    data.paymentAmount ??
    data.amount ??
    payment.paymentAmount ??
    payment.amount;

  if (!orderId) throw new Error("생성 응답에 주문번호가 없습니다.");
  if (paymentAmount == null || !Number.isFinite(Number(paymentAmount))) {
    throw new Error("생성 응답에 결제금액이 없습니다.");
  }

  return {
    orderId,
    orderName,
    paymentAmount: Number(paymentAmount),
  };
}

export function toGroupPaymentReceipt(
  draft: GroupDraft,
  categories: RegistrationCategory[],
): PaymentReceipt {
  return {
    kind: "group",
    title: draft.groupName.trim(),
    subtitle: `${draft.leaderName.trim()} · ${draft.participants.length}명`,
    items: draft.participants.map((p) => {
      const category = findCategory(categories, p.categoryId);
      const souvenir = findSouvenir(category, p.souvenirId);
      const detail = [
        category ? categoryLabel(category) : "",
        souvenir?.name,
        p.selectedSize ? `(${p.selectedSize})` : "",
      ]
        .filter(Boolean)
        .join(" · ");
      return {
        name: p.name.trim(),
        detail,
        amount: category ? categoryFeeAmount(category, p.birth) : 0,
      };
    }),
  };
}
