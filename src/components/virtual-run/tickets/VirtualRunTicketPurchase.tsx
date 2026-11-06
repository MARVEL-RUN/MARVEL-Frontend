"use client";

/** 상품 하나는 items 한 줄로 신청한다. 단품도 받는 사람을 받는다. */
import { Check } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PaymentWidget } from "@/components/main/payment/PaymentWidget";
import {
  AddressField,
  BirthPick,
  FormRow,
  FormSec,
  PasswordField,
  PhoneField,
  ShirtPick,
} from "@/components/main/register/ApplyUi";
import { RegistrationPolicyNotice } from "@/components/main/register/RegistrationPolicyNotice";
import { useRegistrationOptions } from "@/components/main/register/useRegistrationOptions";
import { SheetModal } from "@/components/main/SheetModal";
import { hasTossClientKey, VIRTUAL_RUN_EVENT_ID } from "@/lib/main/config";
import { MainHttpError } from "@/lib/main/fetch";
import type { PaymentOrder } from "@/lib/payment/session";
import {
  categoryLabel,
  packageChildCategories,
  purchasableProductCategories,
  shirtSouvenir,
} from "@/lib/registration-options";
import {
  GENDERS,
  type Consents,
  type Gender,
} from "@/lib/register";
import { isMobileView } from "@/lib/viewport";
import {
  toVirtualRunCreateRequest,
  type VirtualRunBuyerDraft,
  type VirtualRunRecipientDraft,
} from "@/lib/virtual-run/purchase";
import { saveVirtualRunTicketPending } from "@/lib/virtual-run/ticket-payment";
import { createRegistration } from "@/services/main/registrations";
import { useVrPath } from "../layout/VrLink";

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

const EMPTY_BUYER: VirtualRunBuyerDraft = {
  name: "",
  phone: "",
  birth: "",
  gender: "",
  password: "",
  zonecode: "",
  address: "",
  addressDetail: "",
  guardianName: "",
  guardianPhone: "",
  guardianRelation: "",
  guardianConsent: false,
};

function emptyRecipient(eventCategoryId: string): VirtualRunRecipientDraft & { sameAs: boolean } {
  return { eventCategoryId, sameAs: false, name: "", phone: "", birth: "", gender: "" };
}

export function VirtualRunTicketPurchase({
  consents,
  onBack,
}: {
  consents: Consents;
  onBack: () => void;
}) {
  const router = useRouter();
  const toHref = useVrPath();
  const options = useRegistrationOptions(VIRTUAL_RUN_EVENT_ID);
  const products = useMemo(
    () => purchasableProductCategories(options.categories),
    [options.categories],
  );
  const singles = useMemo(
    () => products.filter((item) => item.productType === "SINGLE"),
    [products],
  );
  const packageProduct = useMemo(
    () => products.find((item) => item.productType === "PACKAGE"),
    [products],
  );
  const [kind, setKind] = useState<"single" | "package">("single");
  const [singleId, setSingleId] = useState("");
  const [buyer, setBuyer] = useState<VirtualRunBuyerDraft>(EMPTY_BUYER);
  const [recipients, setRecipients] = useState<
    (VirtualRunRecipientDraft & { sameAs: boolean })[]
  >([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [payOrder, setPayOrder] = useState<PaymentOrder | null>(null);

  const single = singles.find((item) => item.categoryId === singleId) ?? singles[0];
  const packageChildren = useMemo(
    () =>
      packageProduct
        ? packageChildCategories(options.categories, packageProduct.categoryId)
        : [],
    [options.categories, packageProduct],
  );
  const product =
    kind === "package" && packageProduct ? packageProduct : (single ?? packageProduct);
  const children = useMemo(
    () => (product?.productType === "PACKAGE" ? packageChildren : []),
    [packageChildren, product?.productType],
  );
  const souvenir = shirtSouvenir(product);
  const shirtSizes = (souvenir?.sizes ?? []).map((size) => size.trim()).filter(Boolean);

  useEffect(() => {
    if (kind === "single" && !single && packageProduct) setKind("package");
    if (kind === "package" && !packageProduct && single) setKind("single");
  }, [kind, single, packageProduct]);

  useEffect(() => {
    if (product?.productType === "PACKAGE") {
      setRecipients((prev) =>
        children.map(
          (child) =>
            prev.find((row) => row.eventCategoryId === child.categoryId) ??
            emptyRecipient(child.categoryId),
        ),
      );
      return;
    }
    if (product?.productType !== "SINGLE") {
      setRecipients([]);
      return;
    }
    const categoryId = product.categoryId;
    setRecipients((prev) => {
      const kept = prev.find((row) => row.eventCategoryId === categoryId) ?? prev[0];
      if (!kept) return [{ ...emptyRecipient(categoryId), sameAs: true }];
      if (kept.eventCategoryId === categoryId && prev.length === 1) return prev;
      return [{ ...kept, eventCategoryId: categoryId }];
    });
  }, [children, product?.categoryId, product?.productType]);

  function patchBuyer(patch: Partial<VirtualRunBuyerDraft>) {
    setBuyer((prev) => ({ ...prev, ...patch }));
  }

  function patchRecipient(
    eventCategoryId: string,
    patch: Partial<VirtualRunRecipientDraft & { sameAs: boolean }>,
  ) {
    setRecipients((prev) =>
      prev.map((row) =>
        row.eventCategoryId === eventCategoryId ? { ...row, ...patch, sameAs: false } : row,
      ),
    );
  }

  function resolvedRecipients(): VirtualRunRecipientDraft[] {
    return recipients.map((row) =>
      row.sameAs
        ? {
            eventCategoryId: row.eventCategoryId,
            name: buyer.name,
            phone: buyer.phone,
            birth: buyer.birth,
            gender: buyer.gender,
          }
        : row,
    );
  }

  const allSame =
    children.length > 0 &&
    children.every(
      (child) => recipients.find((row) => row.eventCategoryId === child.categoryId)?.sameAs,
    );

  function setAllSame(sameAs: boolean) {
    setRecipients((prev) =>
      children.map((child) => {
        const row =
          prev.find((item) => item.eventCategoryId === child.categoryId) ??
          emptyRecipient(child.categoryId);
        return {
          ...row,
          sameAs,
          ...(sameAs
            ? {
                name: buyer.name,
                phone: buyer.phone,
                birth: buyer.birth,
                gender: buyer.gender,
              }
            : {}),
        };
      }),
    );
  }

  const recipientSlots = product?.productType === "PACKAGE" ? children : product ? [product] : [];

  async function onPay(e: FormEvent) {
    e.preventDefault();
    if (!product || submitting) return;
    if (!hasTossClientKey) {
      setError("결제 연동 설정이 없습니다. env 변경 후 dev 서버를 재시작하세요.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const body = toVirtualRunCreateRequest({
        category: product,
        buyer,
        recipients: resolvedRecipients(),
        addressRequired: options.addressRequired,
        consents,
        selectedSize,
      });
      const created = await createRegistration(VIRTUAL_RUN_EVENT_ID, body);
      const registration: PaymentOrder = {
        orderId: created.orderId,
        orderName: created.orderName || categoryLabel(product),
        paymentAmount: created.paymentAmount,
      };
      saveVirtualRunTicketPending({
        registration,
        customerName: buyer.name.trim() || "참가자",
        phone: buyer.phone,
        kind: product.productType === "PACKAGE" ? "package" : "single",
        roundIds: [],
        savedAt: Date.now(),
      });
      if (isMobileView()) {
        router.push(toHref("/payment"));
        return;
      }
      setPayOrder(registration);
      setPayOpen(true);
    } catch (err) {
      setError(err instanceof MainHttpError || err instanceof Error ? err.message : "신청에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (options.loading) {
    return <p className="form__note">신청 옵션을 불러오는 중...</p>;
  }

  if (!options.registrationOpen) {
    return (
      <>
        <RegistrationPolicyNotice reason={options.registrationReason} />
        <BackRow onBack={onBack} />
      </>
    );
  }

  if (options.errorMessage || !product) {
    return (
      <>
        <p className="form__err" role="alert">
          {options.errorMessage || "구매할 수 있는 버추얼런 상품이 없습니다."}
        </p>
        <BackRow onBack={onBack} />
      </>
    );
  }

  return (
    <>
      <form className="form" onSubmit={onPay} noValidate>
        <section className="block">
          <header className="form__head">
            <h2>티켓 선택</h2>
            <p className="form__note">회차마다 키트 1세트가 배송되고, 구매한 회차만 인증할 수 있습니다.</p>
          </header>
          <ul className="kind-pick vr-pick" role="radiogroup" aria-label="티켓 종류">
            {single ? (
              <li>
                <button
                  type="button"
                  role="radio"
                  aria-checked={product?.productType === "SINGLE"}
                  className={`kind-pick__item${product?.productType === "SINGLE" ? " is-on" : ""}`}
                  onClick={() => setKind("single")}
                >
                  <span className="kind-pick__no">01</span>
                  <span className="kind-pick__body">
                    <span className="kind-pick__code">SINGLE</span>
                    <strong className="kind-pick__title">1회차 티켓</strong>
                    <span className="vr-pick__price">{won(single.amount)}</span>
                    <span className="kind-pick__desc">원하는 회차 하나 · 키트 1세트</span>
                  </span>
                  <span className="vr-pick__mark" aria-hidden>
                    {product?.productType === "SINGLE" ? <Check size={14} strokeWidth={3} /> : null}
                  </span>
                </button>
              </li>
            ) : null}
            {packageProduct ? (
              <li>
                <button
                  type="button"
                  role="radio"
                  aria-checked={product?.productType === "PACKAGE"}
                  className={`kind-pick__item kind-pick__item--cyan${product?.productType === "PACKAGE" ? " is-on" : ""}`}
                  onClick={() => setKind("package")}
                >
                  <span className="kind-pick__no">02</span>
                  <span className="kind-pick__body">
                    <span className="kind-pick__code">PACKAGE</span>
                    <strong className="kind-pick__title">{packageProduct.categoryName || "3회차 패키지"}</strong>
                    <span className="vr-pick__price">{won(packageProduct.amount)}</span>
                    <span className="kind-pick__desc">
                      {packageChildren.map((child) => child.categoryName).join(" · ") || "세 회차"}
                      {packageChildren.length ? ` · 키트 ${packageChildren.length}세트` : ""}
                    </span>
                  </span>
                  <span className="vr-pick__mark" aria-hidden>
                    {product?.productType === "PACKAGE" ? <Check size={14} strokeWidth={3} /> : null}
                  </span>
                </button>
              </li>
            ) : null}
          </ul>
        </section>

        <FormSec kicker="01 / ROUND" title="참가 회차">
          <FormRow label="회차" required>
            {product?.productType === "SINGLE" ? (
              <div className="seg vr-round-seg" role="radiogroup" aria-label="회차">
                {singles.map((item, index) => (
                  <button
                    key={item.categoryId}
                    type="button"
                    role="radio"
                    aria-checked={item.categoryId === single?.categoryId}
                    className={`is-${roundAccent(item, index)}${item.categoryId === single?.categoryId ? " is-on" : ""}`}
                    onClick={() => setSingleId(item.categoryId)}
                  >
                    {item.order ? `${item.order}회차 · ` : ""}
                    {item.categoryName}
                  </button>
                ))}
              </div>
            ) : (
              <div className="seg vr-round-seg">
                {packageChildren.map((item, index) => (
                  <span key={item.categoryId} className={`is-${roundAccent(item, index)} is-on`}>
                    {item.order ? `${item.order}회차 · ` : ""}
                    {item.categoryName}
                  </span>
                ))}
              </div>
            )}
            <p className="form-row__hint">
              {product?.productType === "SINGLE"
                ? "고른 회차의 키트와 러닝 인증 1회가 포함됩니다."
                : "세 회차 키트를 모두 받고, 회차마다 한 번씩 인증합니다."}
            </p>
          </FormRow>
        </FormSec>

        <FormSec kicker="01 / BUYER" title="신청자">
          <FormRow label="이름" required>
            <input
              type="text"
              value={buyer.name}
              onChange={(e) => patchBuyer({ name: e.target.value })}
              autoComplete="name"
            />
          </FormRow>
          <FormRow label="생년월일" required>
            <BirthPick value={buyer.birth} onChange={(birth) => patchBuyer({ birth })} />
          </FormRow>
          <FormRow label="휴대폰 번호" required>
            <PhoneField value={buyer.phone} onChange={(phone) => patchBuyer({ phone })} autoComplete="tel" />
          </FormRow>
          <FormRow label="성별" required>
            <GenderPick value={buyer.gender} onChange={(gender) => patchBuyer({ gender })} />
          </FormRow>
          <FormRow label="신청 비밀번호" required>
            <PasswordField value={buyer.password} onChange={(password) => patchBuyer({ password })} required />
          </FormRow>
          {options.addressRequired ? (
            <FormRow label="배송 주소" required>
              <AddressField
                zonecode={buyer.zonecode}
                address={buyer.address}
                addressDetail={buyer.addressDetail}
                onChange={(patch) => patchBuyer(patch)}
              />
            </FormRow>
          ) : null}
          {shirtSizes.length ? (
            <FormRow label="티셔츠 사이즈" required>
              <ShirtPick value={selectedSize} onChange={setSelectedSize} sizes={shirtSizes} />
            </FormRow>
          ) : null}
        </FormSec>

        {recipientSlots.length ? (
          <FormSec kicker="02 / RUNNERS" title="참가자">
            <div className="vr-recipients__all">
              <p>
                {product.productType === "PACKAGE"
                  ? "회차마다 참가할 사람을 입력합니다. 본인이면 체크하세요."
                  : "받는 사람을 입력합니다. 본인이면 체크하세요."}
              </p>
              {recipientSlots.length > 1 ? (
                <label className={`vr-recipients__same${allSame ? " is-on" : ""}`}>
                  <input
                    type="checkbox"
                    checked={allSame}
                    onChange={(e) => setAllSame(e.target.checked)}
                  />
                  모두 신청자 정보와 동일
                </label>
              ) : null}
            </div>
            <ul className="vr-recipients">
              {recipientSlots.map((child, index) => {
                const row =
                  recipients.find((item) => item.eventCategoryId === child.categoryId) ??
                  emptyRecipient(child.categoryId);
                const shown = row.sameAs
                  ? {
                      ...row,
                      name: buyer.name,
                      phone: buyer.phone,
                      birth: buyer.birth,
                      gender: buyer.gender,
                    }
                  : row;
                return (
                  <li key={child.categoryId} className={`is-${roundAccent(child, index)}`}>
                    <div className="vr-recipients__head">
                      <strong>
                        {index + 1}. {categoryLabel(child)}
                      </strong>
                      <label className={`vr-recipients__same${row.sameAs ? " is-on" : ""}`}>
                        <input
                          type="checkbox"
                          checked={row.sameAs}
                          onChange={(e) => {
                            const sameAs = e.target.checked;
                            setRecipients((prev) =>
                              prev.map((item) =>
                                item.eventCategoryId === child.categoryId
                                  ? {
                                      ...item,
                                      sameAs,
                                      ...(sameAs
                                        ? {
                                            name: buyer.name,
                                            phone: buyer.phone,
                                            birth: buyer.birth,
                                            gender: buyer.gender,
                                          }
                                        : {}),
                                    }
                                  : item,
                              ),
                            );
                          }}
                        />
                        신청자 정보와 동일
                      </label>
                    </div>
                    <FormRow label="이름" required>
                      <input
                        type="text"
                        value={shown.name}
                        onChange={(e) => patchRecipient(child.categoryId, { name: e.target.value })}
                      />
                    </FormRow>
                    <FormRow label="생년월일" required>
                      <BirthPick
                        value={shown.birth}
                        onChange={(birth) => patchRecipient(child.categoryId, { birth })}
                      />
                    </FormRow>
                    <FormRow label="휴대폰 번호" required>
                      <PhoneField
                        value={shown.phone}
                        onChange={(phone) => patchRecipient(child.categoryId, { phone })}
                      />
                    </FormRow>
                    <FormRow label="성별" required>
                      <GenderPick
                        value={shown.gender}
                        onChange={(gender) => patchRecipient(child.categoryId, { gender })}
                      />
                    </FormRow>
                  </li>
                );
              })}
            </ul>
          </FormSec>
        ) : null}

        <section className="vr-sum" aria-label="결제 요약">
          <dl>
            <div>
              <dt>티켓</dt>
              <dd>{product.productType === "PACKAGE" ? packageProduct?.categoryName || "3회차 패키지" : "1회차 티켓"}</dd>
            </div>
            <div>
              <dt>회차</dt>
              <dd>
                {product.productType === "PACKAGE"
                  ? packageChildren.map((child) => child.categoryName).join(" · ") || "—"
                  : single?.categoryName}
              </dd>
            </div>
          </dl>
          <p className="vr-sum__total">
            <span>결제 금액</span>
            <strong>{won(product.amount)}</strong>
          </p>
        </section>

        {error ? (
          <p className="form__err" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flow__nav">
          <button type="button" className="btn btn--ghost" onClick={onBack}>
            이전
          </button>
          <button type="submit" className="btn btn--red" disabled={submitting}>
            {submitting ? "신청 중..." : `${won(product.amount)} 결제하기`}
          </button>
        </div>
      </form>

      {payOpen && payOrder ? (
        <SheetModal kicker="PAY" title="결제하기" onClose={() => setPayOpen(false)}>
          <PaymentWidget
            registration={payOrder}
            customerName={buyer.name.trim() || "참가자"}
            successPath={toHref("/payment/success")}
            failPath={toHref("/payment/fail")}
            onError={setError}
          />
        </SheetModal>
      ) : null}
    </>
  );
}

function roundAccent(
  category: { categoryId: string; categoryName: string },
  index: number,
) {
  const text = `${category.categoryId} ${category.categoryName}`.toLowerCase();
  if (text.includes("avenger") || category.categoryName.includes("어벤")) return "gold";
  if (text.includes("xmen") || text.includes("x-men") || category.categoryName.includes("엑스")) return "red";
  if (text.includes("fantastic") || category.categoryName.includes("판타")) return "blue";
  return (["gold", "red", "blue"] as const)[index % 3];
}
function BackRow({ onBack }: { onBack: () => void }) {
  return (
    <div className="flow__nav">
      <button type="button" className="btn btn--ghost" onClick={onBack}>
        이전
      </button>
    </div>
  );
}

function GenderPick({
  value,
  onChange,
}: {
  value: Gender | "";
  onChange: (next: Gender) => void;
}) {
  return (
    <div className="seg" role="radiogroup" aria-label="성별">
      {GENDERS.map((item) => (
        <button
          key={item.id}
          type="button"
          role="radio"
          aria-checked={value === item.id}
          className={value === item.id ? "is-on" : undefined}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
