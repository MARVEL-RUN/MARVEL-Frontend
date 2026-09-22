"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAppBasePath } from "@/lib/main/useAppBasePath";
import { withAppBase } from "@/lib/preview";
import {
  EMPTY_CONSENTS,
  EMPTY_DRAFT,
  CHILD_ACCOMPANY_NOTE,
  GUARDIAN_AGE_NOTE,
  TIMING_CHIP_NOTE,
  applyCourseForBirth,
  ageBand,
  courseById,
  emailOk,
  filterNoSpaceName,
  applicationPasswordError,
  genderLabel,
  needsGuardian,
  guardianRequiredFor,
  guardianFieldsError,
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
  shirtAssignment,
  souvenirSizes,
  sortedCategories,
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
import { RegisterPayCheckModal } from "./RegisterPayCheckModal";
import {
  AddressField,
  ApplyHint,
  ApplyNotice,
  BirthPick,
  CoursePick,
  EmailField,
  FeeText,
  FormRow,
  FormSec,
  GenderPick,
  GuardianConsentField,
  KitFixed,
  PasswordField,
  PhoneField,
  ShirtPick,
  birthView,
} from "./ApplyUi";
import { GroupFlow } from "./GroupFlow";

const STEPS = ["정보", "확인"] as const;
type Step = 0 | 1;

const NOTICE = [
  "[개인 신청 후, 단체 전환 불가] 단체 참가시 반드시 단체로 신청하시기 바랍니다.",
];

function entryPasswordHint(value: string) {
  if (!value) {
    return { text: "신청조회용 비밀번호 (6자 이상)", tone: "" as const };
  }
  const err = applicationPasswordError(value);
  if (err) return { text: err, tone: "is-err" as const };
  return { text: "사용 가능한 비밀번호입니다.", tone: "is-ok" as const };
}

function entryPasswordConfirmHint(password: string, confirm: string) {
  if (!confirm) return null;
  if (confirm === password) {
    return { text: "비밀번호가 일치합니다.", tone: "is-ok" as const };
  }
  return { text: "비밀번호가 일치하지 않습니다.", tone: "is-err" as const };
}

export function RegisterFlow() {
  const [kind, setKind] = useState<ApplyKind | "">("");
  const [consents, setConsents] = useState<Consents>(EMPTY_CONSENTS);

  function pickKind(next: ApplyKind) {
    setKind(next);
    requestAnimationFrame(scrollPageTop);
  }

  function clearKind() {
    setKind("");
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
    return <GroupFlow consents={consents} onBack={clearKind} />;
  }
  return <IndividualFlow consents={consents} onBack={clearKind} />;
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
  const base = useAppBasePath();
  const [payOpen, setPayOpen] = useState(false);
  const [payCheckOpen, setPayCheckOpen] = useState(false);
  const [categories, setCategories] = useState<RegistrationCategory[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState("");
  const [busyAction, setBusyAction] = useState<"submit" | "pay" | null>(null);
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

  useEffect(() => {
    if (optionsLoading || !categories.length) return;
    setDraft((prev) => {
      if (!prev.courseId) {
        if (!prev.souvenirId && !prev.selectedSize) return prev;
        return { ...prev, souvenirId: "", selectedSize: "" };
      }
      const category = categoryForCourse(categories, prev.courseId, prev.birth);
      const next = shirtAssignment(category, prev.selectedSize, prev.birth);
      if (
        next.souvenirId === prev.souvenirId &&
        next.selectedSize === prev.selectedSize
      ) {
        return prev;
      }
      return { ...prev, ...next };
    });
  }, [categories, optionsLoading]);

  function openPay() {
    if (isMobileView()) {
      router.push(withAppBase(base, "/payment"));
      return;
    }
    setPayOpen(true);
  }

  async function ensureRegistration() {
    if (registration) return registration;
    if (!hasMainApi) throw new Error("API 주소가 설정되지 않았습니다.");
    const created = await createRegistration(
      DEFAULT_EVENT_ID,
      toRegistrationCreateRequest(draft, categories),
    );
    setRegistration(created);
    return created;
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
    if (/\s/.test(draft.name)) return fail("이름은 띄어쓰기 없이 입력하세요.");
    if (!/^\d{8}$/.test(draft.birth)) return fail("생년월일을 선택하세요.");
    if (ageBand(draft.birth) === "tooYoung") {
      return fail("대회일 이후 출생자는 참가할 수 없습니다.");
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
    const guardianErr = guardianFieldsError(draft);
    if (guardianErr) return fail(guardianErr);
    if (!draft.souvenirId) return fail("티셔츠 옵션을 불러오지 못했습니다.");
    if (!draft.selectedSize) return fail("티셔츠 사이즈를 선택하세요.");
    const passwordErr = applicationPasswordError(draft.password ?? "");
    if (passwordErr) return fail(passwordErr);
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
    setPayCheckOpen(true);
  }

  function goSubmitted() {
    setPayCheckOpen(false);
    router.push(withAppBase(base, "/register/complete"));
  }

  async function onSubmitApplication() {
    if (registration) {
      goSubmitted();
      return;
    }

    setBusyAction("submit");
    setError("");
    try {
      await ensureRegistration();
      goSubmitted();
    } catch (err) {
      const message =
        err instanceof MainHttpError
          ? err.message
          : err instanceof Error
            ? err.message
            : "신청서를 제출하지 못했습니다.";
      fail(message);
    } finally {
      setBusyAction(null);
    }
  }

  async function onPay() {
    if (!hasMainApi || !hasTossClientKey) {
      return fail(
        "결제 연동 설정(NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_TOSS_CLIENT_KEY)이 필요합니다. env 변경 후 dev 서버를 재시작하세요.",
      );
    }

    setBusyAction("pay");
    setError("");
    try {
      const created = await ensureRegistration();
      savePendingPayment({
        registration: created,
        customerName: draft.name.trim(),
        savedAt: Date.now(),
      });
      setPayCheckOpen(false);
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
      setBusyAction(null);
    }
  }

  const course = draft.courseId ? courseById(draft.courseId) : undefined;
  const selectedCategory = draft.courseId
    ? categoryForCourse(categories, draft.courseId, draft.birth)
    : undefined;
  const souvenir = findSouvenir(selectedCategory, draft.souvenirId);
  const sizes = souvenirSizes(souvenir, draft.ticket);
  const optionsReady = !optionsLoading && !optionsError && categories.length > 0;
  const passwordHint = entryPasswordHint(draft.password ?? "");
  const passwordConfirmHint = entryPasswordConfirmHint(
    draft.password ?? "",
    draft.passwordConfirm ?? "",
  );
  const guardianRequired = guardianRequiredFor(draft);
  const guardianMinor = needsGuardian(draft.birth);

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

          <FormSec kicker="01 / PROFILE" title="개인정보">
            <FormRow label="이름" required>
              <input
                type="text"
                name="name"
                placeholder="띄어쓰기 없이 입력해주세요."
                value={draft.name}
                onChange={(e) => patch({ name: filterNoSpaceName(e.target.value) })}
                autoComplete="name"
                required
              />
            </FormRow>
            <FormRow label="생년월일" required>
              <BirthPick
                value={draft.birth}
                onChange={(birth) => {
                  const next = applyCourseForBirth(draft.courseId, birth);
                  const category = next.courseId
                    ? categoryForCourse(categories, next.courseId, birth)
                    : undefined;
                  patch({
                    birth,
                    ...next,
                    ...shirtAssignment(category, draft.selectedSize, birth),
                  });
                }}
              />
            </FormRow>
            <FormRow label="성별" required>
              <GenderPick
                name="gender"
                value={draft.gender}
                onChange={(gender) => patch({ gender })}
              />
            </FormRow>
          </FormSec>

          <FormSec kicker="02 / CONTACT" title="연락처 정보">
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

          <FormSec kicker="03 / ADDRESS" title="주소" note="기념품 배송 및 참가 안내에 사용됩니다.">
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
            kicker="04 / GUARDIAN"
            title={guardianMinor ? "보호자 정보" : "보호자 정보 (선택)"}
            note={
              guardianMinor
                ? `${GUARDIAN_AGE_NOTE} 보호자 이름·관계·연락처·동의를 입력해 주세요.`
                : "선택사항입니다. 입력하면 이름·관계·연락처·동의를 모두 작성해 주세요."
            }
          >
            <FormRow label="보호자 이름" required={guardianRequired}>
              <input
                type="text"
                name="guardianName"
                placeholder="띄어쓰기 없이 입력해주세요."
                value={draft.guardianName}
                onChange={(e) => patch({ guardianName: e.target.value })}
                autoComplete="name"
                required={guardianRequired}
              />
            </FormRow>
            <FormRow label="보호자 관계" required={guardianRequired}>
              <input
                type="text"
                name="guardianRelation"
                placeholder="부, 모, 조부모 등"
                value={draft.guardianRelation}
                onChange={(e) => patch({ guardianRelation: e.target.value })}
                required={guardianRequired}
              />
            </FormRow>
            <FormRow label="보호자 연락처" required={guardianRequired}>
              <PhoneField
                name="guardianPhone"
                placeholder="보호자(학부모) 연락처"
                value={draft.guardianPhone}
                onChange={(guardianPhone) => patch({ guardianPhone })}
                required={guardianRequired}
              />
            </FormRow>
            <FormRow label="보호자 동의" required={guardianRequired}>
              <GuardianConsentField
                variant="button"
                agreed={draft.guardianConsent}
                onChange={(guardianConsent) => patch({ guardianConsent })}
              />
              {guardianRequired && !guardianMinor ? (
                <p className="form-row__hint">
                  보호자 정보를 입력한 경우 동의까지 완료해 주세요.
                </p>
              ) : null}
              {guardianMinor ? (
                <p className="form-row__hint">
                  만 14세 미만은 보호자 동의까지 완료해야 신청할 수 있습니다.
                </p>
              ) : null}
            </FormRow>
          </FormSec>

          <FormSec kicker="05 / ENTRY" title="신청 정보">
            <ApplyHint>
              <p>{TIMING_CHIP_NOTE}</p>
            </ApplyHint>
            <FormRow label="참가종목" required>
              <CoursePick
                value={draft.courseId}
                birth={draft.birth}
                onChange={(courseId, ticket) =>
                  patch({
                    courseId,
                    ticket,
                    ...shirtAssignment(
                      categoryForCourse(categories, courseId, draft.birth),
                      draft.selectedSize,
                      draft.birth,
                    ),
                  })
                }
              />
              {ageBand(draft.birth) === "child" ? (
                <p className="form-row__hint">{CHILD_ACCOMPANY_NOTE}</p>
              ) : null}
            </FormRow>
            {optionsError ? (
              <p className="form__err">{optionsError}</p>
            ) : null}
            <FormRow label="패키지">
              <KitFixed courseId={draft.courseId} />
            </FormRow>
            <FormRow label="티셔츠 사이즈" required>
              <ShirtPick
                value={draft.selectedSize}
                sizes={souvenir ? sizes : undefined}
                disabled={!souvenir || !optionsReady}
                onChange={(selectedSize) => patch({ selectedSize })}
              />
              {!draft.courseId ? (
                <p className="form-row__hint">종목을 먼저 선택하세요</p>
              ) : optionsLoading ? (
                <p className="form-row__hint">불러오는 중</p>
              ) : !souvenir && !optionsError ? (
                <p className="form-row__hint">티셔츠 옵션을 불러오지 못했습니다</p>
              ) : null}
            </FormRow>
            <FormRow label="신청 비밀번호" required>
              <PasswordField
                value={draft.password ?? ""}
                onChange={(password) => patch({ password })}
                placeholder="신청 비밀번호를 입력하세요."
                required
              />
              <p
                className={`form-row__hint${passwordHint.tone ? ` ${passwordHint.tone}` : ""}`}
              >
                {passwordHint.text}
              </p>
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
              {passwordConfirmHint ? (
                <p className={`form-row__hint ${passwordConfirmHint.tone}`}>
                  {passwordConfirmHint.text}
                </p>
              ) : null}
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
              <dt>보호자 이름</dt>
              <dd>{draft.guardianName.trim() || "—"}</dd>
            </div>
            <div>
              <dt>보호자 관계</dt>
              <dd>{draft.guardianRelation.trim() || "—"}</dd>
            </div>
            <div>
              <dt>보호자 연락처</dt>
              <dd>{draft.guardianPhone.trim() || "—"}</dd>
            </div>
            <div>
              <dt>보호자 동의</dt>
              <dd>{draft.guardianConsent ? "동의함" : "—"}</dd>
            </div>
            <div>
              <dt>티셔츠 사이즈</dt>
              <dd>{draft.selectedSize || "—"}</dd>
            </div>
            <div>
              <dt>패키지</dt>
              <dd>
                <KitFixed courseId={draft.courseId} />
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
                setPayCheckOpen(false);
                setPayOpen(false);
                setStep(0);
                requestAnimationFrame(scrollPageTop);
              }}
            >
              수정
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={onSubmitApplication}
              disabled={busyAction !== null || Boolean(registration)}
            >
              {busyAction === "submit"
                ? "제출 중..."
                : registration
                  ? "제출 완료"
                  : "신청서 제출"}
            </button>
            <button
              type="button"
              className="btn btn--red"
              onClick={onPay}
              disabled={busyAction !== null}
            >
              {busyAction === "pay" ? "결제 준비 중..." : "결제하기"}
            </button>
          </DockNav>
        </section>
      ) : null}

      <RegisterPayCheckModal
        open={payCheckOpen}
        onClose={() => setPayCheckOpen(false)}
      />

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
