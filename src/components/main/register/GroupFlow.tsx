"use client";

import { useRouter } from "next/navigation";
import { Fragment, FormEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { DEFAULT_EVENT_ID, hasMainApi, hasTossClientKey } from "@/lib/main/config";
import { useAppBasePath } from "@/lib/main/useAppBasePath";
import { withAppBase } from "@/lib/preview";
import { MainHttpError } from "@/lib/main/fetch";
import {
  organizationPaymentOrder,
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
  courseForCategory,
  findCategory,
  groupOptionsFee,
  shirtAssignment,
  shirtSouvenir,
  souvenirSizes,
  sortedCategories,
} from "@/lib/registration-options";
import { scrollPageTop } from "@/lib/scroll-page";
import { isMobileView } from "@/lib/viewport";
import {
  CHILD_AGE_NOTE,
  CHILD_ACCOMPANY_NOTE,
  TIMING_CHIP_NOTE,
  EMPTY_GROUP,
  EMPTY_PARTICIPANT,
  GUARDIAN_AGE_NOTE,
  LEADER_UNDER_AGE_NOTE,
  GENDERS,
  MAX_GROUP_SIZE,
  ageBand,
  formatFee,
  genderLabel,
  emailOk,
  filterNoSpaceName,
  filterOrgAccountInput,
  groupNeedsGuardian,
  orgAccountError,
  applicationPasswordError,
  requiredConsentsOk,
  ticketForBirth,
  underGuardianAge,
  type Consents,
  type Gender,
  type GroupDraft,
  type ParticipantDraft,
} from "@/lib/register";
import { PaymentWidget } from "@/components/main/payment/PaymentWidget";
import {
  checkOrganizationDuplicateId,
  checkOrganizationDuplicateName,
  createOrganizationRegistration,
} from "@/services/main/registrations";
import { fetchRegistrationOptions } from "@/services/main/registration-options";
import type { RegistrationCategory } from "@/services/main/types";
import { SheetModal } from "../SheetModal";
import { DockNav } from "../DockNav";
import { RegisterPayCheckModal } from "./RegisterPayCheckModal";
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
  GROUP_GUARDIAN_CONSENT_LABEL,
  GuardianConsentField,
  KitFixed,
  PasswordField,
  PhoneField,
  ShirtPick,
  birthView,
} from "./ApplyUi";

const STEPS = ["정보", "확인"] as const;
type Step = 0 | 1;

const NOTICE = [
  `한 번에 최대 ${MAX_GROUP_SIZE}명까지 신청할 수 있습니다. 초과 인원은 별도 단체로 신청하세요.`,
  "[개인 신청 후, 단체 전환 불가] 단체 참가시 반드시 단체로 신청하시기 바랍니다.",
];

type FieldCheck = {
  status: "idle" | "checking" | "ready" | "error";
  value: string;
  useable?: boolean;
  hint?: { text: string; tone: "" | "is-err" | "is-ok" };
};

const EMPTY_FIELD_CHECK: FieldCheck = {
  status: "idle",
  value: "",
};

function orgPasswordHint(value: string) {
  if (!value) {
    return { text: "조회용 비밀번호 (6자 이상)", tone: "" as const };
  }
  const err = applicationPasswordError(value);
  if (err) return { text: err, tone: "is-err" as const };
  return { text: "사용 가능한 비밀번호입니다.", tone: "is-ok" as const };
}

function orgPasswordConfirmHint(password: string, confirm: string) {
  if (!confirm) return null;
  if (confirm === password) {
    return { text: "비밀번호가 일치합니다.", tone: "is-ok" as const };
  }
  return { text: "비밀번호가 일치하지 않습니다.", tone: "is-err" as const };
}

function matchesField(check: FieldCheck, value: string) {
  return check.value === value.trim();
}

function groupNameHint(value: string, check: FieldCheck) {
  if (!matchesField(check, value)) return null;
  return check.hint ?? null;
}

function orgAccountHint(value: string, langWarn: boolean, check: FieldCheck) {
  if (langWarn) {
    return { text: "영문으로 입력해주세요.", tone: "is-err" as const };
  }
  if (!value) {
    if (matchesField(check, value) && check.hint) return check.hint;
    return { text: "영문·숫자·특수문자만 입력할 수 있습니다.", tone: "" as const };
  }
  const err = orgAccountError(value);
  if (err) {
    if (matchesField(check, value) && check.hint) return check.hint;
    return { text: err, tone: "is-err" as const };
  }
  if (matchesField(check, value) && check.hint) return check.hint;
  return { text: "영문·숫자·특수문자만 입력할 수 있습니다.", tone: "" as const };
}

function memberPeek(
  p: ParticipantDraft,
  categories: RegistrationCategory[],
) {
  const name = p.name.trim() || "미입력";
  const category = findCategory(categories, p.categoryId);
  if (!category) return name;
  return `${name} · ${categoryLabel(category)} · ${formatFee(categoryFeeAmount(category, p.birth))}`;
}

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
  const [payCheckOpen, setPayCheckOpen] = useState(false);
  const [categories, setCategories] = useState<RegistrationCategory[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [accountLangWarn, setAccountLangWarn] = useState(false);
  const [nameCheck, setNameCheck] = useState<FieldCheck>(EMPTY_FIELD_CHECK);
  const [accountCheck, setAccountCheck] =
    useState<FieldCheck>(EMPTY_FIELD_CHECK);
  const [openMember, setOpenMember] = useState(0);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const router = useRouter();
  const base = useAppBasePath();

  function fail(message: string) {
    setError(message);
    requestAnimationFrame(() => {
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function openPay() {
    if (isMobileView()) {
      router.push(withAppBase(base, "/payment"));
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

  useEffect(() => {
    if (optionsLoading || !categories.length) return;
    setDraft((prev) => {
      let changed = false;
      const participants = prev.participants.map((p) => {
        if (!p.categoryId) {
          if (!p.souvenirId && !p.selectedSize) return p;
          changed = true;
          return { ...p, souvenirId: "", selectedSize: "" };
        }
        const next = shirtAssignment(
          findCategory(categories, p.categoryId),
          p.selectedSize,
          p.birth,
        );
        if (
          next.souvenirId === p.souvenirId &&
          next.selectedSize === p.selectedSize
        ) {
          return p;
        }
        changed = true;
        return { ...p, ...next };
      });
      return changed ? { ...prev, participants } : prev;
    });
  }, [categories, optionsLoading]);

  function patch(next: Partial<GroupDraft>) {
    setDraft((prev) => ({ ...prev, ...next }));
    setError("");
    if ("groupName" in next) setNameCheck(EMPTY_FIELD_CHECK);
    if ("organizationAccount" in next) setAccountCheck(EMPTY_FIELD_CHECK);
  }

  async function runNameDupCheck() {
    const groupName = draft.groupName.trim();
    if (!groupName) {
      setNameCheck({
        status: "error",
        value: "",
        hint: { text: "단체명을 입력하세요.", tone: "is-err" },
      });
      return;
    }
    if (!hasMainApi) {
      setNameCheck({
        status: "error",
        value: groupName,
        hint: { text: "API 주소가 설정되지 않았습니다.", tone: "is-err" },
      });
      return;
    }

    setError("");
    setNameCheck({
      status: "checking",
      value: groupName,
      hint: { text: "중복 확인 중…", tone: "" },
    });
    try {
      const result = await checkOrganizationDuplicateName(
        DEFAULT_EVENT_ID,
        groupName,
      );
      setNameCheck({
        status: "ready",
        value: groupName,
        useable: result.useableGroupName,
        hint: result.useableGroupName
          ? { text: "사용 가능한 단체명입니다.", tone: "is-ok" }
          : { text: "이미 사용 중인 단체명입니다.", tone: "is-err" },
      });
    } catch (err) {
      setNameCheck({
        status: "error",
        value: groupName,
        hint: {
          text:
            err instanceof MainHttpError
              ? err.message
              : "중복 확인에 실패했습니다.",
          tone: "is-err",
        },
      });
    }
  }

  async function runAccountDupCheck() {
    const loginId = draft.organizationAccount.trim();
    const accountErr = orgAccountError(loginId);
    if (accountErr) {
      setAccountCheck({
        status: "error",
        value: loginId,
        hint: { text: accountErr, tone: "is-err" },
      });
      return;
    }
    if (!hasMainApi) {
      setAccountCheck({
        status: "error",
        value: loginId,
        hint: { text: "API 주소가 설정되지 않았습니다.", tone: "is-err" },
      });
      return;
    }

    setError("");
    setAccountCheck({
      status: "checking",
      value: loginId,
      hint: { text: "중복 확인 중…", tone: "" },
    });
    try {
      const result = await checkOrganizationDuplicateId(
        DEFAULT_EVENT_ID,
        loginId,
      );
      setAccountCheck({
        status: "ready",
        value: loginId,
        useable: result.useableLoginId,
        hint: result.useableLoginId
          ? { text: "사용 가능한 계정입니다.", tone: "is-ok" }
          : { text: "이미 사용 중인 계정입니다.", tone: "is-err" },
      });
    } catch (err) {
      setAccountCheck({
        status: "error",
        value: loginId,
        hint: {
          text:
            err instanceof MainHttpError
              ? err.message
              : "중복 확인에 실패했습니다.",
          tone: "is-err",
        },
      });
    }
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
    const next = draft.participants.length;
    patch({
      participants: [...draft.participants, { ...EMPTY_PARTICIPANT }],
    });
    setOpenMember(next);
  }

  function removeMember(i: number) {
    if (draft.participants.length <= 1) return;
    patch({ participants: draft.participants.filter((_, idx) => idx !== i) });
    setOpenMember((prev) => {
      if (prev === i) return Math.max(0, i - 1);
      if (prev > i) return prev - 1;
      return prev;
    });
  }

  function onForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!optionsReady) {
      return fail(optionsError || "신청 옵션을 불러오지 못했습니다.");
    }
    if (!draft.groupName.trim()) return fail("단체명을 입력하세요.");
    if (/\s/.test(draft.groupName)) {
      return fail("단체명은 띄어쓰기 없이 입력하세요.");
    }
    const accountErr = orgAccountError(draft.organizationAccount);
    if (accountErr) return fail(accountErr);
    if (hasMainApi) {
      if (
        nameCheck.status !== "ready" ||
        !matchesField(nameCheck, draft.groupName) ||
        !nameCheck.useable
      ) {
        return fail(
          nameCheck.status === "ready" &&
            matchesField(nameCheck, draft.groupName) &&
            nameCheck.useable === false
            ? "이미 사용 중인 단체명입니다."
            : "단체명 중복검사를 진행해 주세요.",
        );
      }
      if (
        accountCheck.status !== "ready" ||
        !matchesField(accountCheck, draft.organizationAccount) ||
        !accountCheck.useable
      ) {
        return fail(
          accountCheck.status === "ready" &&
            matchesField(accountCheck, draft.organizationAccount) &&
            accountCheck.useable === false
            ? "이미 사용 중인 계정입니다."
            : "단체 계정 중복검사를 진행해 주세요.",
        );
      }
    }
    const passwordErr = applicationPasswordError(draft.organizationPassword ?? "");
    if (passwordErr) return fail(passwordErr);
    if ((draft.organizationPassword ?? "") !== (draft.passwordConfirm ?? "")) {
      return fail("단체 비밀번호가 일치하지 않습니다.");
    }
    if (!draft.leaderName.trim()) return fail("대표자 성명을 입력하세요.");
    if (!/^\d{8}$/.test(draft.leaderBirth)) {
      return fail("대표자 생년월일을 선택하세요.");
    }
    if (underGuardianAge(draft.leaderBirth)) {
      return fail(LEADER_UNDER_AGE_NOTE);
    }
    if (!draft.phone.trim()) return fail("휴대폰번호를 입력하세요.");
    if (draft.email.trim() && !emailOk(draft.email)) {
      return fail("이메일 형식을 확인하세요.");
    }
    if (!(draft.zonecode ?? "").trim() || !(draft.address ?? "").trim()) {
      return fail("우편번호 찾기로 주소를 선택하세요.");
    }
    if (!(draft.addressDetail ?? "").trim()) {
      return fail("상세주소를 입력하세요.");
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
          throw new Error(`참가자 ${n}: 대회일 이후 출생자는 참가할 수 없습니다.`);
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
        const souvenir = shirtSouvenir(category);
        if (!souvenir) {
          throw new Error(`참가자 ${n}: 티셔츠 옵션을 불러오지 못했습니다.`);
        }
        if (!souvenirSizes(souvenir, ticketForBirth(p.birth)).includes(p.selectedSize)) {
          throw new Error(`참가자 ${n}: 티셔츠 사이즈를 선택하세요.`);
        }
      });
    } catch (err) {
      return fail(err instanceof Error ? err.message : "참가자 정보를 확인하세요.");
    }
    if (groupNeedsGuardian(draft.participants) && !draft.guardianConsent) {
      return fail("만 14세 미만 참가자가 있어 단체장 동의가 필요합니다.");
    }
    if (!requiredConsentsOk(draft)) return fail("필수 약관에 동의해 주세요.");
    setError("");
    setStep(1);
    setPayCheckOpen(true);
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
      return fail(
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
        savedAt: Date.now(),
      });
      setPayment(order);
      openPay();
    } catch (err) {
      fail(
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
  const needsGroupGuardian = groupNeedsGuardian(draft.participants);
  const nameHint = groupNameHint(draft.groupName, nameCheck);
  const accountHint = orgAccountHint(
    draft.organizationAccount,
    accountLangWarn,
    accountCheck,
  );
  const passwordHint = orgPasswordHint(draft.organizationPassword);
  const passwordConfirmHint = orgPasswordConfirmHint(
    draft.organizationPassword,
    draft.passwordConfirm,
  );

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

      {step === 0 ? (
        <form className="form" onSubmit={onForm} noValidate>
          <ApplyNotice lines={NOTICE} />

          <FormSec kicker="01 / GROUP" title="단체 정보">
            <FormRow label="단체명" required>
              <div className="field-with-btn">
                <input
                  type="text"
                  placeholder="단체명을 띄어쓰기 없이 입력해주세요"
                  value={draft.groupName}
                  onChange={(e) =>
                    patch({ groupName: filterNoSpaceName(e.target.value) })
                  }
                  className={nameHint?.tone === "is-err" ? "is-err" : undefined}
                  aria-invalid={nameHint?.tone === "is-err"}
                  required
                />
                <button
                  type="button"
                  className="field-with-btn__btn"
                  onClick={runNameDupCheck}
                  disabled={nameCheck.status === "checking"}
                >
                  {nameCheck.status === "checking" ? "확인 중…" : "중복검사"}
                </button>
              </div>
              {nameHint ? (
                <p
                  className={`form-row__hint${nameHint.tone ? ` ${nameHint.tone}` : ""}`}
                >
                  {nameHint.text}
                </p>
              ) : null}
            </FormRow>
            <FormRow label="단체 계정" required>
              <div className="field-with-btn">
                <input
                  type="text"
                  lang="en"
                  spellCheck={false}
                  placeholder="5~20자, 영문·숫자·특수문자"
                  value={draft.organizationAccount}
                  className={accountHint.tone === "is-err" ? "is-err" : undefined}
                  aria-invalid={accountHint.tone === "is-err"}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const next = filterOrgAccountInput(raw);
                    // 한글 등 비ASCII 입력 시도 시에만 안내
                    setAccountLangWarn(/[^\x00-\x7F]/.test(raw));
                    patch({ organizationAccount: next });
                  }}
                  autoComplete="username"
                  required
                />
                <button
                  type="button"
                  className="field-with-btn__btn"
                  onClick={runAccountDupCheck}
                  disabled={accountCheck.status === "checking"}
                >
                  {accountCheck.status === "checking" ? "확인 중…" : "중복검사"}
                </button>
              </div>
              <p
                className={`form-row__hint${accountHint.tone ? ` ${accountHint.tone}` : ""}`}
              >
                {accountHint.text}
              </p>
            </FormRow>
            <FormRow label="단체 비밀번호" required>
              <PasswordField
                value={draft.organizationPassword}
                onChange={(organizationPassword) => patch({ organizationPassword })}
                label="단체 비밀번호"
                placeholder="단체 비밀번호를 입력하세요."
                required
              />
              <p
                className={`form-row__hint${passwordHint.tone ? ` ${passwordHint.tone}` : ""}`}
              >
                {passwordHint.text}
              </p>
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
              {passwordConfirmHint ? (
                <p className={`form-row__hint ${passwordConfirmHint.tone}`}>
                  {passwordConfirmHint.text}
                </p>
              ) : null}
            </FormRow>
          </FormSec>

          <FormSec kicker="02 / LEADER" title="대표자 정보">
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
                yearHint={
                  underGuardianAge(draft.leaderBirth)
                    ? LEADER_UNDER_AGE_NOTE
                    : undefined
                }
              />
            </FormRow>
          </FormSec>

          <FormSec kicker="03 / CONTACT" title="연락처 정보">
            <FormRow label="휴대폰번호" required>
              <PhoneField
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

          <FormSec kicker="04 / ADDRESS" title="주소" note="기념품 배송 및 참가 안내에 사용됩니다.">
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

          <FormSec kicker="05 / RUNNERS" title="참가자">
            <ApplyHint>
              <p>대표자도 대회에 참여하는 경우 아래 참가자 정보를 작성하시기 바랍니다.</p>
              <p>
                {`*(한번에 최대 ${MAX_GROUP_SIZE}명까지만 신청 가능하며, 초과 인원은 별도의 단체로 신청 해주시기 바랍니다.)`}
              </p>
              <p>{CHILD_AGE_NOTE}</p>
              <p>{CHILD_ACCOMPANY_NOTE}</p>
              <p>{GUARDIAN_AGE_NOTE}</p>
              <p>어린이 해당 종목은 어린이 요금이 적용됩니다.</p>
              <p>{TIMING_CHIP_NOTE}</p>
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
                <colgroup>
                  <col className="party__c-no" />
                  <col className="party__c-name" />
                  <col className="party__c-birth" />
                  <col className="party__c-phone" />
                  <col className="party__c-gender" />
                  <col className="party__c-fee" />
                  <col className="party__c-del" />
                </colgroup>
                <thead>
                  <tr>
                    <th rowSpan={2}>번호</th>
                    <th>이름</th>
                    <th>생년월일</th>
                    <th>연락처</th>
                    <th>성별</th>
                    <th rowSpan={2}>참가비</th>
                    <th rowSpan={2}>삭제</th>
                  </tr>
                  <tr>
                    <th>참가종목</th>
                    <th>사이즈</th>
                    <th colSpan={2}>패키지</th>
                  </tr>
                </thead>
                <tbody>
                  {draft.participants.map((p, i) => {
                    const category = findCategory(categories, p.categoryId);
                    const souvenir = shirtSouvenir(category);
                    const sizes = souvenirSizes(
                      souvenir,
                      ticketForBirth(p.birth),
                    );
                    const courseId = category
                      ? (courseForCategory(category)?.id ?? "")
                      : "";
                    const open = openMember === i;
                    return (
                      <Fragment key={i}>
                      <tr className={open ? "party__info is-open" : "party__info"}>
                        <td className="party__no" rowSpan={2}>{i + 1}.</td>
                        <td className="party__peek">
                          <button
                            type="button"
                            onClick={() => setOpenMember(i)}
                          >
                            {memberPeek(p, categories)}
                          </button>
                        </td>
                        <td data-label="이름">
                          <input
                            type="text"
                            placeholder="성명"
                            value={p.name}
                            onChange={(e) => patchMember(i, { name: e.target.value })}
                            required
                          />
                        </td>
                        <td data-label="생년월일">
                          <BirthText
                            value={p.birth}
                            onChange={(birth) => {
                              const current = findCategory(categories, p.categoryId);
                              const keep =
                                current && categoryOpenForBirth(current, birth);
                              patchMember(
                                i,
                                keep
                                  ? {
                                      birth,
                                      ...shirtAssignment(
                                        current,
                                        p.selectedSize,
                                        birth,
                                      ),
                                    }
                                  : {
                                      birth,
                                      categoryId: "",
                                      ...shirtAssignment(undefined, "", birth),
                                    },
                              );
                            }}
                          />
                        </td>
                        <td data-label="연락처">
                          <PhoneField
                            placeholder="연락처"
                            value={p.phone}
                            onChange={(phone) => patchMember(i, { phone })}
                            required
                          />
                        </td>
                        <td data-label="성별">
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
                        <td className="party__fee" data-label="참가비" rowSpan={2}>
                          {category
                            ? formatFee(categoryFeeAmount(category, p.birth))
                            : "—"}
                        </td>
                        <td className="party__del" rowSpan={2}>
                          <button
                            type="button"
                            className="party__expand"
                            onClick={() => setOpenMember(i)}
                          >
                            펼치기
                          </button>
                          <button
                            type="button"
                            className="party__fold"
                            onClick={() => setOpenMember(-1)}
                          >
                            접기
                          </button>
                          <button
                            type="button"
                            className="party__remove"
                            onClick={() => removeMember(i)}
                            disabled={draft.participants.length <= 1}
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                      <tr className={open ? "party__more is-open" : "party__more"}>
                        <td data-label="참가종목">
                          <select
                            value={p.categoryId}
                            onChange={(e) => {
                              const categoryId = e.target.value;
                              patchMember(i, {
                                categoryId,
                                ...shirtAssignment(
                                  findCategory(categories, categoryId),
                                  p.selectedSize,
                                  p.birth,
                                ),
                              });
                            }}
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
                        <td data-label="사이즈">
                          <ShirtPick
                            value={p.selectedSize}
                            sizes={sizes}
                            disabled={!souvenir}
                            onChange={(selectedSize) =>
                              patchMember(i, { selectedSize })
                            }
                          />
                        </td>
                        <td colSpan={2} data-label="패키지">
                          <KitFixed courseId={courseId} />
                        </td>
                      </tr>
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="party-sum">합계 {formatFee(total)}</p>
          </FormSec>

          {needsGroupGuardian ? (
            <FormSec kicker="06 / CONSENT" title="단체장 동의">
              <ApplyHint>
                <p>{GUARDIAN_AGE_NOTE}</p>
                <p>참가자 개개인 동의 대신 단체장 동의로 진행합니다.</p>
              </ApplyHint>
              <FormRow label="법정대리인 동의" required>
                <GuardianConsentField
                  label={GROUP_GUARDIAN_CONSENT_LABEL}
                  variant="button"
                  agreed={draft.guardianConsent}
                  onChange={(guardianConsent) => patch({ guardianConsent })}
                />
              </FormRow>
            </FormSec>
          ) : null}

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
              <dd>{draft.email.trim() || "—"}</dd>
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
            {needsGroupGuardian ? (
              <div>
                <dt>단체장 동의</dt>
                <dd>{draft.guardianConsent ? "동의함" : "—"}</dd>
              </div>
            ) : null}
          </dl>
          <ul className="member-list">
            {draft.participants.map((p, i) => {
              const category = findCategory(categories, p.categoryId);
              const courseId = category
                ? (courseForCategory(category)?.id ?? "")
                : "";
              return (
                <li key={`${p.name}-${i}`}>
                  <strong>
                    {String(i + 1).padStart(2, "0")} {p.name}
                  </strong>
                  <span>
                    {category ? categoryLabel(category) : "—"} ·{" "}
                    {p.selectedSize || "—"} · {birthView(p.birth)} ·{" "}
                    {p.gender ? genderLabel(p.gender) : "—"} · {p.phone}
                  </span>
                  <KitFixed courseId={courseId} />
                </li>
              );
            })}
          </ul>
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
              className="btn btn--red"
              onClick={onPay}
              disabled={busy}
            >
              {busy ? "결제 준비 중..." : "결제하기"}
            </button>
          </DockNav>
        </section>
      ) : null}

      <RegisterPayCheckModal
        open={payCheckOpen}
        onClose={() => setPayCheckOpen(false)}
      />

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
