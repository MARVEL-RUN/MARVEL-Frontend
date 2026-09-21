import { formatAddressForApi } from "@/lib/daumPostcode";
import {
  formatPhone,
  termsAgreementFields,
  type GroupDraft,
} from "@/lib/register";
import type { OrganizationRegistrationRequest } from "@/services/main/types";
import type { PaymentOrder } from "./session";
import { birthToApi, genderToApi, phoneDigits } from "./map";

export function toOrganizationRegistrationRequest(
  draft: GroupDraft,
): OrganizationRegistrationRequest {
  return {
    account: {
      organizationName: draft.groupName.trim(),
      organizationLoginId: draft.organizationAccount.trim(),
      organizationPassword: draft.organizationPassword.trim(),
    },
    profile: {
      address: formatAddressForApi(draft.zonecode.trim(), draft.address.trim()),
      addressDetail: draft.addressDetail.trim(),
      birth: birthToApi(draft.leaderBirth),
      phNum: formatPhone(draft.phone),
      email: draft.email.trim(),
      leaderName: draft.leaderName.trim(),
      guardianConsent: draft.guardianConsent,
    },
    registrations: draft.participants.map((p) => ({
      eventCategoryId: p.categoryId,
      selectedSouvenirList: [
        { souvenirId: p.souvenirId, selectedSize: p.selectedSize },
      ],
      name: p.name.trim(),
      phNum: phoneDigits(p.phone),
      birth: birthToApi(p.birth),
      gender: genderToApi(p.gender),
    })),
    ...termsAgreementFields(draft),
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
