"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useLayoutEffect, useState } from "react";
import { DEFAULT_EVENT_ID, hasMainApi, hasTossClientKey } from "@/lib/main/config";
import { MainHttpError } from "@/lib/main/fetch";
import {
  organizationPaymentOrder,
  toGroupPaymentReceipt,
  toOrganizationRegistrationRequest,
} from "@/lib/payment/organization";
import {
  savePendingPayment,
  type PaymentOrder,
} from "@/lib/payment/session";
import {
  categoryClosedReason,
  categoryFeeAmount,
  categoryLabel,
  categoryOpenForBirth,
  findCategory,
  findSouvenir,
  groupOptionsFee,
  souvenirSizes,
  sortedCategories,
  sortedSouvenirs,
} from "@/lib/registration-options";
import { scrollPageTop } from "@/lib/scroll-page";
import { isMobileView } from "@/lib/viewport";
import {
  CHILD_AGE_NOTE,
  EMPTY_GROUP,
  EMPTY_PARTICIPANT,
  GUARDIAN_AGE_NOTE,
  GENDERS,
  MAX_GROUP_SIZE,
  ageBand,
  formatFee,
  genderLabel,
  emailOk,
  requiredConsentsOk,
  type Consents,
  type Gender,
  type GroupDraft,
  type ParticipantDraft,
} from "@/lib/register";
import { PaymentWidget } from "@/components/main/payment/PaymentWidget";
import { createOrganizationRegistration } from "@/services/main/registrations";
import { fetchRegistrationOptions } from "@/services/main/registration-options";
import type { RegistrationCategory } from "@/services/main/types";
import { SheetModal } from "../SheetModal";
import {
  AddressField,
  ApplyHint,
  ApplyNotice,
  CourseFeeTable,
  BirthPick,
  BirthText,
  EmailField,
  FormRow,
  FormSec,
  PasswordField,
  PhoneField,
  birthView,
} from "./ApplyUi";

const STEPS = ["정보", "확인"] as const;
type Step = 0 | 1;

const NOTICE = [
  `한 번에 최대 ${MAX_GROUP_SIZE}명까지 신청할 수 있습니다. 초과 인원은 별도 단체로 신청하세요.`,
  "[개인 신청 후, 단체 전환 불가] 단체 참가시 반드시 단체로 신청하시기 바랍니다.",
];

export function GroupFlow({
  onBack,
  consents,
}: {
  onBack: () => void;
  consents: Consents;
}) {
  const [step, setStep] = useState<Step>(0);
  const [draft, setDraft] = useState<GroupDraft>({ ...EMPTY_GROUP, ...consents });
  const [payment, setPayment] = useState<PaymentOrder | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [categories, setCategories] = useState<RegistrationCategory[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  function openPay() {
    if (isMobileView()) {
      router.push("/payment");
      return;
    }
    setPayOpen(true);
  }

  useEffect(() => {
    if (!hasMainApi) {
      setOptionsLoading(false);
      setOptionsError("API 주소가 설정되지 않았습니다.");
      return;
    }

    let cancelled = false;
    setOptionsLoading(true);
    setOptionsError("");

    fetchRegistrationOptions(DEFAULT_EVENT_ID)
      .then((data) => {
        if (cancelled) return;
        setCategories(sortedCategories(data.categories ?? []));
      })
      .catch((err) => {
        if (cancelled) return;
        setOptionsError(
          err instanceof MainHttpError
            ? err.message
            : "신청 옵션을 불러오지 못했습니다.",
        );
      })
      .finally(() => {
        if (!cancelled) setOptionsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function patch(next: Partial<GroupDraft>) {
    setDraft((prev) => ({ ...prev, ...next }));
    setError("");
  }

  function patchMember(i: number, next: Partial<ParticipantDraft>) {
    setDraft((prev) => ({
      ...prev,
      participants: prev.participants.map((p, idx) =>
        idx === i ? { ...p, ...next } : p,
      ),
    }));
    setError("");
  }

  function addMember() {
    if (draft.participants.length >= MAX_GROUP_SIZE) {
      setError(`한 번에 ${MAX_GROUP_SIZE}명까지 신청할 수 있습니다.`);
      return;
    }
    patch({
      participants: [...draft.participants, { ...EMPTY_PARTICIPANT }],
    });
  }

  function removeMember(i: number) {
    if (draft.participants.length <= 1) return;
    patch({ participants: draft.participants.filter((_, idx) => idx !== i) });
  }

  function onForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!draft.groupName.trim()) return setError("단체명을 입력하세요.");
    if (!draft.organizationAccount.trim()) {
      return setError("단체 계정을 입력하세요.");
    }
    if ((draft.organizationPassword ?? "").trim().length < 4) {
      return setError("단체 비밀번호를 4자 이상 입력하세요.");
    }
    if ((draft.organizationPassword ?? "") !== (draft.passwordConfirm ?? "")) {
      return setError("단체 비밀번호가 일치하지 않습니다.");
    }
    if (!draft.leaderName.trim()) return setError("대표자 성명을 입력하세요.");
    if (!/^\d{8}$/.test(draft.leaderBirth)) {
      return setError("대표자 생년월일을 선택하세요.");
    }
    if (!draft.phone.trim()) return setError("휴대폰번호를 입력하세요.");
    if (!emailOk(draft.email)) return setError("이메일을 입력하세요.");
    if (!(draft.zonecode ?? "").trim() || !(draft.address ?? "").trim()) {
      return setError("우편번호 찾기로 주소를 선택하세요.");
    }
    if (!(draft.addressDetail ?? "").trim()) {
      return setError("상세주소를 입력하세요.");
    }
    try {
      draft.participants.forEach((p, i) => {
        const n = i + 1;
        if (!p.name.trim()) throw new Error(`참가자 ${n}: 이름을 입력하세요.`);
        if (!/^\d{8}$/.test(p.birth)) {
          throw new Error(`참가자 ${n}: 생년월일을 입력하세요.`);
        }
        if (!p.phone.trim()) throw new Error(`참가자 ${n}: 연락처를 입력하세요.`);
        if (ageBand(p.birth) === "tooYoung") {
          throw new Error(`참가자 ${n}: 만 6세 미만은 참가할 수 없습니다.`);
        }
        if (!p.gender) throw new Error(`참가자 ${n}: 성별을 선택하세요.`);
        const category = findCategory(categories, p.categoryId);
        if (!category) throw new Error(`참가자 ${n}: 참가종목을 선택하세요.`);
        if (category.isActive === false) {
          throw new Error(`참가자 ${n}: 마감된 종목입니다.`);
        }
        if (!categoryOpenForBirth(category, p.birth)) {
          throw new Error(
            `참가자 ${n}: ${categoryClosedReason(category, p.birth) || "이 종목은 참가할 수 없습니다."}`,
          );
        }
        const souvenir = findSouvenir(category, p.souvenirId);
        if (!souvenir) throw new Error(`참가자 ${n}: 기념품을 선택하세요.`);
        if (!souvenirSizes(souvenir).includes(p.selectedSize)) {
          throw new Error(`참가자 ${n}: 기념품 사이즈를 선택하세요.`);
        }
      });
    } catch (err) {
      return setError(err instanceof Error ? err.message : "참가자 정보를 확인하세요.");
    }
    if (!requiredConsentsOk(draft)) return setError("필수 약관에 동의해 주세요.");
    setStep(1);
  }

  useLayoutEffect(() => {
    if (step !== 0) scrollPageTop();
  }, [step]);

  async function onPay() {
    if (payment) {
      openPay();
      return;
    }
    if (!hasMainApi || !hasTossClientKey) {
      return setError(
        "결제 연동 설정(NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_TOSS_CLIENT_KEY)이 필요합니다. env 변경 후 dev 서버를 재시작하세요.",
      );
    }

    setBusy(true);
    setError("");
    try {
      const created = await createOrganizationRegistration(
        DEFAULT_EVENT_ID,
        toOrganizationRegistrationRequest(draft),
      );
      const order = organizationPaymentOrder(created);
      savePendingPayment({
        registration: order,
        customerName: draft.leaderName.trim(),
        receipt: toGroupPaymentReceipt(draft, categories),
        savedAt: Date.now(),
      });
      setPayment(order);
      openPay();
    } catch (err) {
      setError(
        err instanceof MainHttpError
          ? err.message
          : err instanceof Error
            ? err.message
            : "결제를 시작하지 못했습니다.",
      );
    } finally {
      setBusy(false);
    }
  }

  const total = payment?.paymentAmount ?? groupOptionsFee(draft, categories);
  const optionsReady = !optionsLoading && !optionsError && categories.length > 0;

  return (
    <div className="flow">
      <ol className="stepper" aria-label="단체 신청 단계">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={i === step ? "is-on" : i < step ? "is-done" : undefined}
          >
            <span>{String(i + 1).padStart(2, "0")}</span>
            {label}
          </li>
        ))}
      </ol>

      {error ? <p className="form__err">{error}</p> : null}

      {step === 0 ? (
        <form className="form" onSubmit={onForm} noValidate>
          <ApplyNotice lines={NOTICE} />

          <FormSec title="단체 정보">
            <FormRow label="단체명" required>
              <input
                type="text"
                placeholder="단체명을 띄어쓰기 없이 입력해주세요"
                value={draft.groupName}
                onChange={(e) => patch({ groupName: e.target.value })}
                required
              />
            </FormRow>
            <FormRow label="단체 계정" required>
              <input
                type="text"
                placeholder="조회·로그인에 사용할 단체 계정"
                value={draft.organizationAccount}
                onChange={(e) => patch({ organizationAccount: e.target.value })}
                autoComplete="username"
                required
              />
            </FormRow>
            <FormRow label="단체 비밀번호" required>
              <PasswordField
                value={draft.organizationPassword}
                onChange={(organizationPassword) => patch({ organizationPassword })}
                label="단체 비밀번호"
                placeholder="조회용 비밀번호 (4자 이상)"
                required
              />
            </FormRow>
            <FormRow label="단체 비밀번호 확인" required>
              <PasswordField
                name="passwordConfirm"
                label="단체 비밀번호 확인"
                placeholder="단체 비밀번호를 다시 입력하세요."
                value={draft.passwordConfirm}
                onChange={(passwordConfirm) => patch({ passwordConfirm })}
                required
              />
            </FormRow>
          </FormSec>

          <FormSec title="대표자 정보">
            <FormRow label="대표자 성명" required>
              <input
                type="text"
                placeholder="대표자 성명을 입력해주세요"
                value={draft.leaderName}
                onChange={(e) => patch({ leaderName: e.target.value })}
                required
              />
            </FormRow>
            <FormRow label="대표자 생년월일" required>
              <BirthPick
                value={draft.leaderBirth}
                onChange={(leaderBirth) => patch({ leaderBirth })}
              />
            </FormRow>
          </FormSec>

          <FormSec title="연락처 정보">
            <FormRow label="휴대폰번호" required>
              <PhoneField
                placeholder="휴대폰번호를 입력해주세요."
                value={draft.phone}
                onChange={(phone) => patch({ phone })}
                autoComplete="tel"
                required
              />
            </FormRow>
            <FormRow label="이메일" required>
              <EmailField
                value={draft.email}
                onChange={(email) => patch({ email })}
                required
              />
            </FormRow>
          </FormSec>

          <FormSec title="주소" note="기념품 배송 및 참가 안내에 사용됩니다.">
            <FormRow label="주소" required>
              <AddressField
                zonecode={draft.zonecode}
                address={draft.address}
                addressDetail={draft.addressDetail}
                onChange={patch}
                required
              />
            </FormRow>
          </FormSec>

          <FormSec title="참가자">
            <ApplyHint>
              <p>대표자도 대회에 참여하는 경우 아래 참가자 정보를 작성하시기 바랍니다.</p>
              <p>
                {`*(한번에 최대 ${MAX_GROUP_SIZE}명까지만 신청 가능하며, 초과 인원은 별도의 단체로 신청 해주시기 바랍니다.)`}
              </p>
              <p>{CHILD_AGE_NOTE}</p>
              <p>{GUARDIAN_AGE_NOTE}</p>
              <p>어린이 해당 종목은 어린이 요금이 적용됩니다.</p>
              <CourseFeeTable />
            </ApplyHint>
            <div className="party-bar">
              <p>{draft.participants.length}명 등록</p>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={addMember}
                disabled={draft.participants.length >= MAX_GROUP_SIZE}
              >
                참가자 추가
              </button>
            </div>
            {optionsError ? <p className="form__err">{optionsError}</p> : null}
            {optionsLoading ? (
              <p className="form__note">신청 옵션을 불러오는 중...</p>
            ) : null}
            <div className="party-wrap">
              <table className="party">
                <thead>
                  <tr>
                    <th>번호</th>
                    <th>이름</th>
                    <th>생년월일</th>
                    <th>연락처</th>
                    <th>성별</th>
                    <th>참가종목</th>
                    <th>기념품</th>
                    <th>사이즈</th>
                    <th>참가비</th>
                    <th>삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {draft.participants.map((p, i) => {
                    const category = findCategory(categories, p.categoryId);
                    const souvenir = findSouvenir(category, p.souvenirId);
                    const sizes = souvenirSizes(souvenir);
                    return (
                      <tr key={i}>
                        <td className="party__no">{i + 1}.</td>
                        <td>
                          <input
                            type="text"
                            placeholder="성명"
                            value={p.name}
                            onChange={(e) => patchMember(i, { name: e.target.value })}
                            required
                          />
                        </td>
                        <td>
                          <BirthText
                            value={p.birth}
                            onChange={(birth) => {
                              const current = findCategory(categories, p.categoryId);
                              const keep =
                                current && categoryOpenForBirth(current, birth);
                              patchMember(
                                i,
                                keep
                                  ? { birth }
                                  : {
                                      birth,
                                      categoryId: "",
                                      souvenirId: "",
                                      selectedSize: "",
                                    },
                              );
                            }}
                          />
                        </td>
                        <td>
                          <PhoneField
                            placeholder="연락처"
                            value={p.phone}
                            onChange={(phone) => patchMember(i, { phone })}
                            required
                          />
                        </td>
                        <td>
                          <select
                            value={p.gender}
                            onChange={(e) =>
                              patchMember(i, { gender: e.target.value as Gender })
                            }
                            required
                          >
                            <option value="">성별</option>
                            {GENDERS.map((g) => (
                              <option key={g.id} value={g.id}>
                                {g.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            value={p.categoryId}
                            onChange={(e) =>
                              patchMember(i, {
                                categoryId: e.target.value,
                                souvenirId: "",
                                selectedSize: "",
                              })
                            }
                            disabled={!optionsReady}
                            required
                          >
                            <option value="">
                              {optionsLoading ? "불러오는 중" : "참가종목"}
                            </option>
                            {categories.map((item) => {
                              const ageOff = !categoryOpenForBirth(item, p.birth);
                              const closed = item.isActive === false;
                              const reason = closed
                                ? "마감"
                                : ageOff
                                  ? categoryClosedReason(item, p.birth)
                                  : "";
                              return (
                                <option
                                  key={item.categoryId}
                                  value={item.categoryId}
                                  disabled={closed || ageOff}
                                >
                                  {categoryLabel(item)}
                                  {reason ? ` (${reason})` : ""}
                                </option>
                              );
                            })}
                          </select>
                        </td>
                        <td>
                          <select
                            value={p.souvenirId}
                            onChange={(e) => {
                              const souvenirId = e.target.value;
                              const next = findSouvenir(category, souvenirId);
                              const nextSizes = souvenirSizes(next);
                              patchMember(i, {
                                souvenirId,
                                selectedSize:
                                  nextSizes.length === 1 ? nextSizes[0] : "",
                              });
                            }}
                            disabled={!p.categoryId || category?.isActive === false}
                            required
                          >
                            <option value="">기념품</option>
                            {sortedSouvenirs(category).map((item) => (
                              <option key={item.souvenirId} value={item.souvenirId}>
                                {item.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            value={p.selectedSize}
                            onChange={(e) =>
                              patchMember(i, { selectedSize: e.target.value })
                            }
                            disabled={!p.souvenirId}
                            required
                          >
                            <option value="">사이즈</option>
                            {p.souvenirId
                              ? sizes.map((size) => (
                                  <option key={size} value={size}>
                                    {size}
                                  </option>
                                ))
                              : null}
                          </select>
                        </td>
                        <td className="party__fee">
                          {category
                            ? formatFee(categoryFeeAmount(category, p.birth))
                            : "—"}
                        </td>
                        <td className="party__del">
                          <button
                            type="button"
                            onClick={() => removeMember(i)}
                            disabled={draft.participants.length <= 1}
                            aria-label="참가자 삭제"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="party-sum">합계 {formatFee(total)}</p>
          </FormSec>

          <div className="flow__nav">
            <button type="button" className="btn btn--ghost" onClick={onBack}>
              유형 변경
            </button>
            <button
              type="submit"
              className="btn btn--red"
              disabled={!optionsReady}
            >
              확인하기
            </button>
          </div>
        </form>
      ) : null}

      {step === 1 ? (
        <section className="block">
          <h2>접수 내용을 확인하세요</h2>
          <dl className="spec">
            <div>
              <dt>단체명</dt>
              <dd>{draft.groupName}</dd>
            </div>
            <div>
              <dt>단체 계정</dt>
              <dd>{draft.organizationAccount}</dd>
            </div>
            <div>
              <dt>대표자</dt>
              <dd>{draft.leaderName}</dd>
            </div>
            <div>
              <dt>대표자 생년월일</dt>
              <dd>{birthView(draft.leaderBirth)}</dd>
            </div>
            <div>
              <dt>휴대폰번호</dt>
              <dd>{draft.phone}</dd>
            </div>
            <div>
              <dt>이메일</dt>
              <dd>{draft.email}</dd>
            </div>
            <div>
              <dt>주소</dt>
              <dd>
                ({draft.zonecode}) {draft.address} {draft.addressDetail}
              </dd>
            </div>
            <div>
              <dt>인원</dt>
              <dd>{draft.participants.length}명</dd>
            </div>
            <div>
              <dt>합계</dt>
              <dd>{formatFee(total)}</dd>
            </div>
          </dl>
          <ul className="member-list">
            {draft.participants.map((p, i) => {
              const category = findCategory(categories, p.categoryId);
              const souvenir = findSouvenir(category, p.souvenirId);
              return (
                <li key={`${p.name}-${i}`}>
                  <strong>
                    {String(i + 1).padStart(2, "0")} {p.name}
                  </strong>
                  <span>
                    {category ? categoryLabel(category) : "—"} ·{" "}
                    {souvenir?.name ?? "—"} ({p.selectedSize || "—"}) ·{" "}
                    {birthView(p.birth)} · {p.gender ? genderLabel(p.gender) : "—"} ·{" "}
                    {p.phone}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="flow__nav">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setPayOpen(false);
                setStep(0);
                requestAnimationFrame(scrollPageTop);
              }}
            >
              수정
            </button>
            <button
              type="button"
              className="btn btn--red"
              onClick={onPay}
              disabled={busy}
            >
              {busy ? "결제 준비 중..." : "결제하기"}
            </button>
          </div>
        </section>
      ) : null}

      {payOpen && payment ? (
        <SheetModal
          kicker="PAY"
          title="결제하기"
          onClose={() => setPayOpen(false)}
        >
          <PaymentWidget
            registration={payment}
            customerName={draft.leaderName.trim()}
            onError={setError}
          />
        </SheetModal>
      ) : null}
    </div>
  );
}
