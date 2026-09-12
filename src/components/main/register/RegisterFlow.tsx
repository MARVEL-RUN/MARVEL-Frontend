"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import {
  CHILD_AGE_NOTE,
  EMPTY_CONSENTS,
  EMPTY_DRAFT,
  GUARDIAN_AGE_NOTE,
  applyCourseForBirth,
  ageBand,
  emailOk,
  needsGuardian,
  requiredConsentsOk,
  type ApplyKind,
  type Consents,
  type EntryDraft,
} from "@/lib/register";
import { DEFAULT_EVENT_ID, hasMainApi, hasTossClientKey } from "@/lib/main/config";
import { MainHttpError } from "@/lib/main/fetch";
import {
  eventCategoryIdForCourse,
  genderToApi,
  phoneDigits,
} from "@/lib/payment/map";
import { formatAddressForApi } from "@/lib/daumPostcode";
import { savePendingPayment } from "@/lib/payment/session";
import { createRegistration } from "@/services/main/registrations";
import type { RegistrationCreateResponse } from "@/services/main/types";
import { PaymentWidget } from "@/components/main/payment/PaymentWidget";
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
  ShirtPick,
} from "./ApplyUi";
import { GroupFlow } from "./GroupFlow";

const STEPS = ["정보", "결제"] as const;
type Step = 0 | 1;

const NOTICE = [
  "신청조회에 필요하니 주문번호를 저장해 두세요.",
  "[개인 신청 후, 단체 전환 불가] 단체 참가시 반드시 단체로 신청하시기 바랍니다.",
];

export function RegisterFlow() {
  const [kind, setKind] = useState<ApplyKind | "">("");
  const [consents, setConsents] = useState<Consents>(EMPTY_CONSENTS);

  function pickKind(next: ApplyKind) {
    setKind(next);
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const errorRef = useRef<HTMLParagraphElement>(null);

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

  async function onPay(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = (draft.password ?? "").trim();
    const zonecode = (draft.zonecode ?? "").trim();
    const address = (draft.address ?? "").trim();
    const addressDetail = (draft.addressDetail ?? "").trim();

    if (!draft.name.trim()) return fail("이름을 입력하세요.");
    if (!/^\d{8}$/.test(draft.birth)) return fail("생년월일을 선택하세요.");
    if (ageBand(draft.birth) === "tooYoung") {
      return fail("만 6세 미만은 참가할 수 없습니다.");
    }
    if (draft.gender !== "male" && draft.gender !== "female") {
      return fail("성별을 선택하세요.");
    }
    if (!draft.phone.trim()) return fail("휴대폰번호를 입력하세요.");
    if (!emailOk(draft.email)) return fail("이메일을 입력하세요.");
    if (!draft.courseId) return fail("참가종목을 선택하세요.");
    if (needsGuardian(draft.birth) && !draft.emergency.trim()) {
      return fail("만 14세 미만은 보호자 연락처를 입력하세요.");
    }
    if (!draft.shirt) return fail("기념품을 선택하세요.");
    if (password.length < 4) {
      return fail("신청 비밀번호를 4자 이상 입력하세요.");
    }
    if (!zonecode || !address) {
      return fail("우편번호 찾기로 주소를 선택하세요.");
    }
    if (!addressDetail) return fail("상세주소를 입력하세요.");
    if (!requiredConsentsOk(draft)) return fail("필수 약관에 동의해 주세요.");

    if (!hasMainApi || !hasTossClientKey) {
      return fail(
        "결제 연동 설정(NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_TOSS_CLIENT_KEY)이 필요합니다. env 변경 후 dev 서버를 재시작하세요.",
      );
    }

    setBusy(true);
    setError("");
    try {
      const created = await createRegistration(DEFAULT_EVENT_ID, {
        eventCategoryId: eventCategoryIdForCourse(draft.courseId),
        password,
        name: draft.name.trim(),
        phNum: phoneDigits(draft.phone),
        birth: draft.birth,
        gender: genderToApi(draft.gender),
        address: formatAddressForApi(zonecode, address),
        addressDetail,
      });
      savePendingPayment({
        registration: created,
        customerName: draft.name.trim(),
        savedAt: Date.now(),
      });
      setRegistration(created);
      setStep(1);
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
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

      {step === 0 || !error ? null : (
        <p className="form__err" role="alert">
          {error}
        </p>
      )}

      {step === 0 ? (
        <form className="form" onSubmit={onPay} noValidate>
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
                  onChange={(birth) =>
                    patch({ birth, ...applyCourseForBirth(draft.courseId, birth) })
                  }
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
                onChange={(courseId, ticket) => patch({ courseId, ticket })}
              />
            </FormRow>
            <FormRow label="기념품" required>
              <ShirtPick
                value={draft.shirt}
                onChange={(shirt) => patch({ shirt })}
              />
            </FormRow>
            <FormRow label="신청 비밀번호" required>
              <PasswordField
                value={draft.password ?? ""}
                onChange={(password) => patch({ password })}
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
            <button type="submit" className="btn btn--red" disabled={busy}>
              {busy ? "결제 준비 중..." : "결제하기"}
            </button>
          </div>
        </form>
      ) : null}

      {step === 1 && registration ? (
        <PaymentWidget
          registration={registration}
          customerName={draft.name.trim()}
          onError={setError}
        />
      ) : null}

      {step === 1 && !registration ? (
        <section className="block">
          <p className="form__err">결제 정보가 없습니다. 다시 신청해 주세요.</p>
          <div className="flow__nav">
            <Link href="/register" className="btn btn--red">
              신청으로
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
