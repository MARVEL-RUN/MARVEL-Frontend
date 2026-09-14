"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  CHILD_AGE_NOTE,
  EMPTY_CONSENTS,
  EMPTY_DRAFT,
  GUARDIAN_AGE_NOTE,
  applyCourseForBirth,
  ageBand,
  courseById,
  emailOk,
  genderLabel,
  needsGuardian,
  requiredConsentsOk,
  ticketFee,
  ticketLabel,
  type ApplyKind,
  type Consents,
  type EntryDraft,
} from "@/lib/register";
import { DEFAULT_EVENT_ID, hasMainApi, hasTossClientKey } from "@/lib/main/config";
import { MainHttpError } from "@/lib/main/fetch";
import { toRegistrationCreateRequest } from "@/lib/payment/individual";
import { savePendingPayment } from "@/lib/payment/session";
import {
  categoryForCourse,
  findSouvenir,
  souvenirSizes,
  sortedCategories,
  sortedSouvenirs,
} from "@/lib/registration-options";
import { scrollPageTop } from "@/lib/scroll-page";
import { isMobileView } from "@/lib/viewport";
import { createRegistration } from "@/services/main/registrations";
import { fetchRegistrationOptions } from "@/services/main/registration-options";
import type {
  RegistrationCategory,
  RegistrationCreateResponse,
} from "@/services/main/types";
import { PaymentWidget } from "@/components/main/payment/PaymentWidget";
import { SheetModal } from "@/components/main/SheetModal";
import { DockNav } from "@/components/main/DockNav";
import { ApplyTerms } from "./ApplyTerms";
import {
  AddressField,
  ApplyNotice,
  BirthPick,
  CoursePick,
  EmailField,
  FeeText,
  FormRow,
  FormSec,
  GenderPick,
  PasswordField,
  PhoneField,
  birthView,
} from "./ApplyUi";
import { GroupFlow } from "./GroupFlow";

const STEPS = ["정보", "확인"] as const;
type Step = 0 | 1;

const NOTICE = [
  "[개인 신청 후, 단체 전환 불가] 단체 참가시 반드시 단체로 신청하시기 바랍니다.",
];

export function RegisterFlow() {
  const [kind, setKind] = useState<ApplyKind | "">("");
  const [consents, setConsents] = useState<Consents>(EMPTY_CONSENTS);

  function pickKind(next: ApplyKind) {
    setKind(next);
    requestAnimationFrame(scrollPageTop);
  }

  if (!kind) {
    return (
      <ApplyTerms
        values={consents}
        onChange={setConsents}
        onPick={pickKind}
      />
    );
  }
  if (kind === "group") {
    return <GroupFlow consents={consents} onBack={() => setKind("")} />;
  }
  return <IndividualFlow consents={consents} onBack={() => setKind("")} />;
}

function IndividualFlow({
  onBack,
  consents,
}: {
  onBack: () => void;
  consents: Consents;
}) {
  const [step, setStep] = useState<Step>(0);
  const [draft, setDraft] = useState<EntryDraft>(() => ({
    ...EMPTY_DRAFT,
    ...consents,
  }));
  const [registration, setRegistration] =
    useState<RegistrationCreateResponse | null>(null);
  const router = useRouter();
  const [payOpen, setPayOpen] = useState(false);
  const [categories, setCategories] = useState<RegistrationCategory[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const errorRef = useRef<HTMLParagraphElement>(null);

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

  function openPay() {
    if (isMobileView()) {
      router.push("/payment");
      return;
    }
    setPayOpen(true);
  }

  useLayoutEffect(() => {
    if (step === 1) scrollPageTop();
  }, [step]);

  function patch(next: Partial<EntryDraft>) {
    setDraft((prev) => ({ ...prev, ...next }));
    setError("");
  }

  function fail(message: string) {
    setError(message);
    requestAnimationFrame(() => {
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function onReview(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!draft.name.trim()) return fail("이름을 입력하세요.");
    if (!/^\d{8}$/.test(draft.birth)) return fail("생년월일을 선택하세요.");
    if (ageBand(draft.birth) === "tooYoung") {
      return fail("만 6세 미만은 참가할 수 없습니다.");
    }
    if (draft.gender !== "male" && draft.gender !== "female") {
      return fail("성별을 선택하세요.");
    }
    if (!draft.phone.trim()) return fail("휴대폰번호를 입력하세요.");
    if (draft.email.trim() && !emailOk(draft.email)) {
      return fail("이메일 형식을 확인하세요.");
    }
    if (!draft.courseId) return fail("참가종목을 선택하세요.");
    if (optionsLoading) return fail("신청 옵션을 불러오는 중입니다.");
    if (optionsError || !categories.length) {
      return fail(optionsError || "신청 옵션을 불러오지 못했습니다.");
    }
    try {
      toRegistrationCreateRequest(draft, categories);
    } catch (err) {
      return fail(err instanceof Error ? err.message : "입력 내용을 확인하세요.");
    }
    if (needsGuardian(draft.birth) && !draft.emergency.trim()) {
      return fail("만 14세 미만은 보호자 연락처를 입력하세요.");
    }
    if (!draft.souvenirId) return fail("기념품을 선택하세요.");
    if (!draft.selectedSize) return fail("기념품 사이즈를 선택하세요.");
    if ((draft.password ?? "").trim().length < 4) {
      return fail("신청 비밀번호를 4자 이상 입력하세요.");
    }
    if ((draft.password ?? "") !== (draft.passwordConfirm ?? "")) {
      return fail("신청 비밀번호가 일치하지 않습니다.");
    }
    if (!(draft.zonecode ?? "").trim() || !(draft.address ?? "").trim()) {
      return fail("우편번호 찾기로 주소를 선택하세요.");
    }
    if (!(draft.addressDetail ?? "").trim()) return fail("상세주소를 입력하세요.");
    if (!requiredConsentsOk(draft)) return fail("필수 약관에 동의해 주세요.");
    setError("");
    setStep(1);
  }

  async function onPay() {
    if (registration) {
      openPay();
      return;
    }
    if (!hasMainApi || !hasTossClientKey) {
      return fail(
        "결제 연동 설정(NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_TOSS_CLIENT_KEY)이 필요합니다. env 변경 후 dev 서버를 재시작하세요.",
      );
    }

    setBusy(true);
    setError("");
    try {
      const created = await createRegistration(
        DEFAULT_EVENT_ID,
        toRegistrationCreateRequest(draft, categories),
      );
      savePendingPayment({
        registration: created,
        customerName: draft.name.trim(),
        savedAt: Date.now(),
      });
      setRegistration(created);
      openPay();
    } catch (err) {
      const message =
        err instanceof MainHttpError
          ? err.message
          : err instanceof Error
            ? err.message
            : "결제를 시작하지 못했습니다.";
      fail(message);
    } finally {
      setBusy(false);
    }
  }

  const course = draft.courseId ? courseById(draft.courseId) : undefined;
  const selectedCategory = draft.courseId
    ? categoryForCourse(categories, draft.courseId, draft.birth)
    : undefined;
  const souvenir = findSouvenir(selectedCategory, draft.souvenirId);
  const sizes = souvenirSizes(souvenir);
  const optionsReady = !optionsLoading && !optionsError && categories.length > 0;

  return (
    <div className="flow">
      <ol className="stepper" aria-label="신청 단계">
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

      {step === 0 ? (
        <form className="form" onSubmit={onReview} noValidate>
          <ApplyNotice lines={NOTICE} />

          <FormSec title="개인정보">
            <FormRow label="이름" required>
              <input
                type="text"
                name="name"
                placeholder="띄어쓰기 없이 입력해주세요."
                value={draft.name}
                onChange={(e) => patch({ name: e.target.value })}
                autoComplete="name"
                required
              />
            </FormRow>
            <FormRow label="생년월일" required>
              <div>
                <BirthPick
                  value={draft.birth}
                  onChange={(birth) => {
                    const next = applyCourseForBirth(draft.courseId, birth);
                    const keepCourse = next.courseId === draft.courseId;
                    patch({
                      birth,
                      ...next,
                      ...(keepCourse
                        ? {}
                        : { souvenirId: "", selectedSize: "" }),
                    });
                  }}
                />
                <p className="form-row__hint">
                  {CHILD_AGE_NOTE}
                  <br />
                  {GUARDIAN_AGE_NOTE}
                </p>
              </div>
            </FormRow>
            <FormRow label="성별" required>
              <GenderPick
                name="gender"
                value={draft.gender}
                onChange={(gender) => patch({ gender })}
              />
            </FormRow>
          </FormSec>

          <FormSec title="연락처 정보">
            <FormRow label="휴대폰번호" required>
              <PhoneField
                name="phone"
                placeholder="휴대폰번호를 입력해주세요."
                value={draft.phone}
                onChange={(phone) => patch({ phone })}
                autoComplete="tel"
                required
              />
            </FormRow>
            <FormRow label="이메일">
              <EmailField
                value={draft.email}
                onChange={(email) => patch({ email })}
              />
            </FormRow>
          </FormSec>

          <FormSec title="주소" note="기념품 배송 및 참가 안내에 사용됩니다.">
            <FormRow label="주소" required>
              <AddressField
                zonecode={draft.zonecode ?? ""}
                address={draft.address ?? ""}
                addressDetail={draft.addressDetail ?? ""}
                onChange={patch}
                required
              />
            </FormRow>
          </FormSec>

          <FormSec
            title={needsGuardian(draft.birth) ? "보호자 정보" : "보호자 정보 (선택)"}
            note={
              needsGuardian(draft.birth)
                ? `${GUARDIAN_AGE_NOTE}. 보호자 연락처를 입력해 주세요.`
                : "선택사항이지만, 응급 상황에 대비해 가능하면 입력해 주세요."
            }
          >
            <FormRow label="보호자 연락처" required={needsGuardian(draft.birth)}>
              <PhoneField
                name="emergency"
                placeholder="보호자 연락처를 입력해주세요."
                value={draft.emergency}
                onChange={(emergency) => patch({ emergency })}
                required={needsGuardian(draft.birth)}
              />
            </FormRow>
          </FormSec>

          <FormSec title="신청 정보">
            <FormRow label="참가종목" required>
              <CoursePick
                value={draft.courseId}
                birth={draft.birth}
                onChange={(courseId, ticket) =>
                  patch({
                    courseId,
                    ticket,
                    souvenirId: "",
                    selectedSize: "",
                  })
                }
              />
            </FormRow>
            {optionsError ? (
              <p className="form__err">{optionsError}</p>
            ) : null}
            <FormRow label="기념품" required>
              <select
                value={draft.souvenirId}
                onChange={(e) => {
                  const souvenirId = e.target.value;
                  const next = findSouvenir(selectedCategory, souvenirId);
                  const nextSizes = souvenirSizes(next);
                  patch({
                    souvenirId,
                    selectedSize: nextSizes.length === 1 ? nextSizes[0] : "",
                  });
                }}
                disabled={!draft.courseId || !optionsReady}
                required
              >
                <option value="">
                  {optionsLoading
                    ? "불러오는 중"
                    : draft.courseId
                      ? "기념품"
                      : "종목을 먼저 선택하세요"}
                </option>
                {sortedSouvenirs(selectedCategory).map((item) => (
                  <option key={item.souvenirId} value={item.souvenirId}>
                    {item.name}
                  </option>
                ))}
              </select>
            </FormRow>
            <FormRow label="사이즈" required>
              <select
                value={draft.selectedSize}
                onChange={(e) => patch({ selectedSize: e.target.value })}
                disabled={!draft.souvenirId}
                required
              >
                <option value="">사이즈</option>
                {draft.souvenirId
                  ? sizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))
                  : null}
              </select>
            </FormRow>
            <FormRow label="신청 비밀번호" required>
              <PasswordField
                value={draft.password ?? ""}
                onChange={(password) => patch({ password })}
                required
              />
            </FormRow>
            <FormRow label="신청 비밀번호 확인" required>
              <PasswordField
                name="passwordConfirm"
                label="신청 비밀번호 확인"
                placeholder="신청 비밀번호를 다시 입력하세요."
                value={draft.passwordConfirm ?? ""}
                onChange={(passwordConfirm) => patch({ passwordConfirm })}
                required
              />
            </FormRow>
            <FormRow label="참가비">
              {draft.courseId ? (
                <FeeText courseId={draft.courseId} ticket={draft.ticket} />
              ) : (
                <p className="fee-text fee-text--wait">종목을 선택하면 표시됩니다</p>
              )}
            </FormRow>
          </FormSec>

          <div className="flow__nav">
            {error ? (
              <p ref={errorRef} className="form__err flow__err" role="alert">
                {error}
              </p>
            ) : null}
            <button type="button" className="btn btn--ghost" onClick={onBack}>
              유형 변경
            </button>
            <button type="submit" className="btn btn--red">
              확인하기
            </button>
          </div>
        </form>
      ) : null}

      {step === 1 && course ? (
        <section className="block">
          <h2>접수 내용을 확인하세요</h2>
          <dl className="spec">
            <div>
              <dt>참가종목</dt>
              <dd>
                {course.distance} · {ticketLabel(draft.ticket)}
                <small>{ticketFee(course, draft.ticket)}</small>
              </dd>
            </div>
            <div>
              <dt>이름</dt>
              <dd>{draft.name}</dd>
            </div>
            <div>
              <dt>생년월일</dt>
              <dd>{birthView(draft.birth)}</dd>
            </div>
            <div>
              <dt>성별</dt>
              <dd>{draft.gender ? genderLabel(draft.gender) : "—"}</dd>
            </div>
            <div>
              <dt>휴대폰번호</dt>
              <dd>{draft.phone}</dd>
            </div>
            <div>
              <dt>이메일</dt>
              <dd>{draft.email.trim() || "—"}</dd>
            </div>
            <div>
              <dt>주소</dt>
              <dd>
                ({draft.zonecode}) {draft.address} {draft.addressDetail}
              </dd>
            </div>
            <div>
              <dt>보호자 연락처</dt>
              <dd>{draft.emergency.trim() || "—"}</dd>
            </div>
            <div>
              <dt>기념품</dt>
              <dd>
                {souvenir?.name ?? "—"} ({draft.selectedSize || "—"})
              </dd>
            </div>
          </dl>
          <DockNav>
            {error ? (
              <p ref={errorRef} className="form__err flow__err" role="alert">
                {error}
              </p>
            ) : null}
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
          </DockNav>
        </section>
      ) : null}

      {payOpen && registration ? (
        <SheetModal
          kicker="PAY"
          title="결제하기"
          onClose={() => setPayOpen(false)}
        >
          <PaymentWidget
            registration={registration}
            customerName={draft.name.trim()}
            onError={setError}
          />
        </SheetModal>
      ) : null}
    </div>
  );
}
