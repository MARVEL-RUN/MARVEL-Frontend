"use client";

import { DEFAULT_EVENT_ID } from "@/lib/main/config";
import { formatAddressForApi } from "@/lib/daumPostcode";
import {
  CHILD_ACCOMPANY_NOTE,
  GENDERS,
  GUARDIAN_AGE_NOTE,
  MAX_GROUP_SIZE,
  TIMING_CHIP_NOTE,
  ageBand,
  emailOk,
  formatFee,
  formatPhone,
  needsGuardian,
  guardianRequiredFor,
  groupNeedsGuardian,
  ticketForBirth,
  type CourseId,
  type Gender,
} from "@/lib/register";
import { genderLabel } from "@/lib/registration-gender";
import {
  categoryClosedReason,
  categoryFeeAmount,
  categoryForCourse,
  categoryLabel,
  categoryOpenForBirth,
  courseForCategory,
  findCategory,
  findCategoryByLabel,
  shirtAssignment,
  shirtSouvenir,
  souvenirSizes,
} from "@/lib/registration-options";
import { fetchRegistrationOptions } from "@/services/main/registration-options";
import { organizationLookupParticipants } from "@/services/main/registrations";
import type {
  IndividualRegistrationLookupRequest,
  IndividualRegistrationModifyRequest,
  OrganizationLookupParticipant,
  OrganizationLookupRequest,
  OrganizationParticipantModifyRequest,
  OrganizationRegistrationModifyRequest,
  RegistrationCategory,
  RegistrationReceipt,
  RegistrationSouvenirSelection,
} from "@/services/main/types";
import { CircleAlert, X } from "lucide-react";
import { FormEvent, Fragment, useEffect, useId, useLayoutEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  AddressField,
  ApplyHint,
  BirthPick,
  BirthText,
  birthView,
  CoursePick,
  EmailField,
  FeeText,
  FormRow,
  FormSec,
  GenderPick,
  GROUP_GUARDIAN_CONSENT_LABEL,
  GuardianConsentField,
  KitFixed,
  PhoneField,
  ShirtPick,
} from "../register/ApplyUi";
import { DockNav } from "../DockNav";
import { RegisterPayCheckModal } from "../register/RegisterPayCheckModal";
import { scrollPageTop } from "@/lib/scroll-page";

export type LookupModifyAction = "submit" | "pay";

function toApiBirth(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 8) return raw.trim();
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

function toApiPhone(raw: string) {
  return raw.replace(/\D/g, "");
}

function splitApiAddress(raw?: string | null) {
  const text = (raw ?? "").trim();
  const hit = text.match(/^\[(\d{5})\]\s*(.*)$/);
  if (hit) return { zonecode: hit[1], address: hit[2] };
  return { zonecode: "", address: text };
}

function personFormError(name: string, birth: string, phone: string, gender: string) {
  if (!name.trim()) return "이름을 입력하세요.";
  if (birth.replace(/\D/g, "").length !== 8) return "생년월일을 입력하세요.";
  if (phone.replace(/\D/g, "").length < 10) return "전화번호를 입력하세요.";
  if (gender !== "M" && gender !== "F") return "성별을 선택하세요.";
  return "";
}

function toUiGender(gender?: string | null): Gender | "" {
  const key = toApiGender(gender);
  if (key === "F") return "female";
  if (key === "M") return "male";
  return "";
}

function memberShirtSize(
  selectedSouvenirList: RegistrationSouvenirSelection[],
  category: RegistrationCategory | undefined,
) {
  const souvenir = shirtSouvenir(category);
  if (!souvenir) return "";
  return (
    selectedSouvenirList.find((row) => row.souvenirId === souvenir.souvenirId)?.selectedSize ||
    ""
  );
}

function withShirtSize(
  category: RegistrationCategory | undefined,
  prev: RegistrationSouvenirSelection[],
  selectedSize: string,
  birth: string,
): RegistrationSouvenirSelection[] {
  const assigned = shirtAssignment(category, selectedSize, birth);
  if (!assigned.souvenirId) return selectionsForCategory(category, prev);
  return (category?.souvenirs ?? []).map((item) =>
    item.souvenirId === assigned.souvenirId
      ? { souvenirId: item.souvenirId, selectedSize: assigned.selectedSize }
      : {
        souvenirId: item.souvenirId,
        selectedSize:
          prev.find((row) => row.souvenirId === item.souvenirId)?.selectedSize ||
          item.sizes[0] ||
          "",
      },
  );
}

function toApiGender(raw?: string | null): "M" | "F" | "" {
  const key = (raw ?? "").trim().toUpperCase();
  if (key === "M" || key === "MALE") return "M";
  if (key === "F" || key === "FEMALE") return "F";
  return "";
}

function souvenirSelections(
  items?: { souvenirId: string; selectedSize?: string; size?: string }[] | null,
): RegistrationSouvenirSelection[] {
  return (items ?? []).map((item) => ({
    souvenirId: item.souvenirId,
    selectedSize: item.selectedSize || item.size || "",
  }));
}

function selectionsForCategory(
  category: RegistrationCategory | undefined,
  prev: RegistrationSouvenirSelection[],
) {
  if (!category?.souvenirs.length) return prev;
  return category.souvenirs.map((item) => ({
    souvenirId: item.souvenirId,
    selectedSize:
      prev.find((row) => row.souvenirId === item.souvenirId)?.selectedSize ||
      item.sizes[0] ||
      "",
  }));
}

export function LookupRefundModal({
  open,
  busy,
  error,
  onClose,
  onConfirm,
}: {
  open: boolean;
  busy: boolean;
  error: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const titleId = useId();
  const errorId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, busy, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="inquiry-secret" role="presentation">
      <button
        type="button"
        className="inquiry-secret__dim"
        onClick={() => {
          if (!busy) onClose();
        }}
        aria-label="닫기"
      />
      <div
        className="inquiry-secret__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={error ? errorId : undefined}
      >
        <header className="inquiry-secret__head">
          <span className="inquiry-secret__icon" aria-hidden>
            <CircleAlert size={20} strokeWidth={2.25} />
          </span>
          <h2 id={titleId}>정말로 환불하시겠습니까?</h2>
          <button
            type="button"
            className="inquiry-secret__x"
            onClick={onClose}
            disabled={busy}
            aria-label="닫기"
          >
            <X size={20} strokeWidth={2.25} />
          </button>
        </header>
        <p className="inquiry-secret__desc">
          이 접수를 취소하고 환불을 신청합니다.
        </p>
        {error ? (
          <p id={errorId} className="inquiry-secret__error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="inquiry-secret__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>
            취소
          </button>
          <button type="button" className="btn btn--red" onClick={onConfirm} disabled={busy}>
            {busy ? "신청 중..." : "환불 신청"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function IndividualLookupEdit({
  receipt,
  access,
  busy,
  error,
  onBack,
  onSubmit,
}: {
  receipt: RegistrationReceipt;
  access: IndividualRegistrationLookupRequest;
  busy: boolean;
  error: string;
  onBack: () => void;
  onSubmit: (body: IndividualRegistrationModifyRequest, action: LookupModifyAction) => void;
}) {
  const parsedAddress = splitApiAddress(receipt.address);
  const [step, setStep] = useState(0);
  const [payCheckOpen, setPayCheckOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<LookupModifyAction | null>(null);
  const [categories, setCategories] = useState<RegistrationCategory[]>([]);
  const [optionsError, setOptionsError] = useState("");
  const [name] = useState(receipt.name?.trim() || access.name);
  const [birth] = useState((receipt.birth || access.birth).replace(/\D/g, ""));
  const [phone] = useState(receipt.phNum || access.phNum);
  const [email, setEmail] = useState(receipt.email?.trim() || "");
  const [gender] = useState<"M" | "F" | "">(toApiGender(receipt.gender));
  const [zonecode, setZonecode] = useState(parsedAddress.zonecode);
  const [address, setAddress] = useState(parsedAddress.address);
  const [addressDetail, setAddressDetail] = useState(receipt.addressDetail?.trim() || "");
  const [guardianName, setGuardianName] = useState(receipt.guardianName?.trim() || "");
  const [guardianRelation, setGuardianRelation] = useState(
    receipt.guardianRelationship?.trim() || "",
  );
  const [guardianPhone, setGuardianPhone] = useState(receipt.guardianPhNum || "");
  const [guardianConsent, setGuardianConsent] = useState(
    () => receipt.guardianConsent === true,
  );
  const [eventCategoryId, setEventCategoryId] = useState(receipt.eventCategoryId || "");
  const [souvenirs, setSouvenirs] = useState(
    souvenirSelections(receipt.selectedSouvenirList),
  );
  const [hint, setHint] = useState("");

  useLayoutEffect(() => {
    scrollPageTop();
  }, []);

  useLayoutEffect(() => {
    if (step !== 0) scrollPageTop();
  }, [step]);

  useEffect(() => {
    if (!busy) setPendingAction(null);
  }, [busy]);

  useEffect(() => {
    let alive = true;
    fetchRegistrationOptions(DEFAULT_EVENT_ID)
      .then((data) => {
        if (!alive) return;
        setCategories(data.categories ?? []);
      })
      .catch(() => {
        if (!alive) return;
        setOptionsError("참가 옵션을 불러오지 못했습니다.");
      });
    return () => {
      alive = false;
    };
  }, []);

  const category = useMemo(
    () => findCategory(categories, eventCategoryId),
    [categories, eventCategoryId],
  );
  const mappedCourse = category ? courseForCategory(category) : undefined;
  const courseId: CourseId | "" = mappedCourse?.id ?? "";
  const souvenir = shirtSouvenir(category);
  const sizes = souvenirSizes(souvenir, ticketForBirth(birth));
  const selectedSize = memberShirtSize(souvenirs, category);
  const ticket = ticketForBirth(birth);
  const optionsReady = categories.length > 0;
  const guardianMinor = needsGuardian(birth);
  const guardianRequired = guardianRequiredFor({
    birth,
    guardianName,
    guardianRelation,
    guardianPhone,
    guardianConsent,
  });

  function applyCategory(
    next: RegistrationCategory | undefined,
    size = selectedSize,
    nextBirth = birth,
  ) {
    setEventCategoryId(next?.categoryId ?? "");
    setSouvenirs(withShirtSize(next, souvenirs, size, nextBirth));
  }

  function onCourseChange(nextCourseId: CourseId) {
    const next = categoryForCourse(categories, nextCourseId, birth);
    applyCategory(next);
  }

  function validateForm() {
    const invalid =
      personFormError(name, birth, phone, gender) ||
      (!zonecode.trim() || !address.trim() ? "우편번호 찾기로 주소를 선택하세요." : "") ||
      (!addressDetail.trim() ? "상세주소를 입력하세요." : "") ||
      (guardianRequired && !guardianName.trim() ? "보호자 이름을 입력하세요." : "") ||
      (guardianRequired && !guardianRelation.trim() ? "보호자 관계를 입력하세요." : "") ||
      (guardianRequired && guardianPhone.replace(/\D/g, "").length < 10
        ? "보호자 연락처를 입력하세요."
        : "") ||
      (guardianRequired && !guardianConsent ? "보호자 동의가 필요합니다." : "") ||
      (email.trim() && !emailOk(email) ? "이메일 형식을 확인하세요." : "") ||
      (!eventCategoryId ? "참가종목을 선택하세요." : "") ||
      (souvenir && !selectedSize ? "티셔츠 사이즈를 선택하세요." : "");
    if (invalid) return invalid;
    if (gender !== "M" && gender !== "F") return "성별을 선택하세요.";
    return "";
  }

  function buildPayload(): IndividualRegistrationModifyRequest | null {
    if (gender !== "M" && gender !== "F") return null;
    return {
      access,
      eventCategoryId,
      selectedSouvenirList: souvenirs,
      name: name.trim(),
      phNum: toApiPhone(phone),
      birth: toApiBirth(birth),
      gender,
      address: formatAddressForApi(zonecode, address),
      addressDetail: addressDetail.trim(),
      guardianName: guardianName.trim() || undefined,
      guardianPhNum: toApiPhone(guardianPhone) || undefined,
      guardianRelationship: guardianRelation.trim() || undefined,
      guardianConsent: guardianRequired ? guardianConsent : false,
      ...(email.trim() ? { email: email.trim() } : {}),
    };
  }

  function goReview(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const invalid = validateForm();
    if (invalid) {
      setHint(invalid);
      return;
    }
    setHint("");
    setStep(1);
    setPayCheckOpen(true);
  }

  function runModify(action: LookupModifyAction) {
    const body = buildPayload();
    if (!body) return;
    setPendingAction(action);
    onSubmit(body, action);
  }

  const addressView = [zonecode.trim() ? `(${zonecode})` : "", address, addressDetail]
    .filter(Boolean)
    .join(" ");

  return (
    <>
    {step === 0 ? (
    <form className="form lookup-edit" onSubmit={goReview} noValidate>
      <div className="form__head">
        <h2>개인 접수 수정</h2>
        <p className="form__note">조회한 접수 정보를 수정합니다.</p>
        <p className="lookup-edit__lock-note">
          개인정보(이름·생년월일·성별)와 휴대폰 번호는 수정할 수 없습니다.
        </p>
      </div>

      <FormSec kicker="01 / PROFILE" title="개인정보">
        <FormRow label="이름" required locked>
          <input
            type="text"
            name="name"
            placeholder="띄어쓰기 없이 입력해주세요."
            value={name}
            autoComplete="name"
            required
            disabled
            readOnly
          />
        </FormRow>
        <FormRow label="생년월일" required locked>
          <BirthPick value={birth} onChange={() => { }} disabled />
        </FormRow>
        <FormRow label="성별" required locked>
          <GenderPick
            name="gender"
            value={toUiGender(gender)}
            onChange={() => { }}
            disabled
          />
        </FormRow>
      </FormSec>

      <FormSec kicker="02 / CONTACT" title="연락처 정보">
        <FormRow label="휴대폰번호" required locked>
          <PhoneField
            name="phone"
            placeholder="휴대폰번호를 입력해주세요."
            value={phone}
            onChange={() => { }}
            autoComplete="tel"
            required
            disabled
          />
        </FormRow>
        <FormRow label="이메일">
          <EmailField value={email} onChange={setEmail} />
        </FormRow>
      </FormSec>

      <FormSec kicker="03 / ADDRESS" title="주소" note="기념품 배송 및 참가 안내에 사용됩니다.">
        <FormRow label="주소" required>
          <AddressField
            zonecode={zonecode}
            address={address}
            addressDetail={addressDetail}
            onChange={(next) => {
              if (next.zonecode != null) setZonecode(next.zonecode);
              if (next.address != null) setAddress(next.address);
              if (next.addressDetail != null) setAddressDetail(next.addressDetail);
            }}
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
            value={guardianName}
            onChange={(e) => setGuardianName(e.target.value)}
            autoComplete="name"
            required={guardianRequired}
          />
        </FormRow>
        <FormRow label="보호자 관계" required={guardianRequired}>
          <input
            type="text"
            name="guardianRelation"
            placeholder="부, 모, 조부모 등"
            value={guardianRelation}
            onChange={(e) => setGuardianRelation(e.target.value)}
            required={guardianRequired}
          />
        </FormRow>
        <FormRow label="보호자 연락처" required={guardianRequired}>
          <PhoneField
            name="guardianPhone"
            placeholder="보호자(학부모) 연락처"
            value={guardianPhone}
            onChange={setGuardianPhone}
            required={guardianRequired}
          />
        </FormRow>
        <FormRow label="보호자 동의" required={guardianRequired}>
          <GuardianConsentField
            variant="button"
            agreed={guardianConsent}
            onChange={setGuardianConsent}
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
          <CoursePick value={courseId} birth={birth} onChange={onCourseChange} />
          {ageBand(birth) === "child" ? (
            <p className="form-row__hint">{CHILD_ACCOMPANY_NOTE}</p>
          ) : null}
        </FormRow>
        {optionsError ? <p className="form__err">{optionsError}</p> : null}
        <FormRow label="패키지">
          <KitFixed courseId={courseId} />
        </FormRow>
        <FormRow label="티셔츠 사이즈" required>
          <ShirtPick
            value={selectedSize}
            sizes={souvenir ? sizes : undefined}
            disabled={!souvenir || !optionsReady}
            onChange={(size) => applyCategory(category, size)}
          />
          {!eventCategoryId ? (
            <p className="form-row__hint">종목을 먼저 선택하세요</p>
          ) : !souvenir && !optionsError ? (
            <p className="form-row__hint">티셔츠 옵션을 불러오지 못했습니다</p>
          ) : null}
        </FormRow>
        <FormRow label="참가비">
          {courseId ? (
            <FeeText courseId={courseId} ticket={ticket} />
          ) : (
            <p className="fee-text fee-text--wait">종목을 선택하면 표시됩니다</p>
          )}
        </FormRow>
      </FormSec>

      {hint || error ? (
        <p className="form__err flow__err" role="alert">
          {hint || error}
        </p>
      ) : null}
      <div className="flow__nav">
        <button type="button" className="btn btn--ghost" onClick={onBack} disabled={busy}>
          돌아가기
        </button>
        <button type="submit" className="btn btn--red" disabled={busy}>
          확인하기
        </button>
      </div>
    </form>
    ) : null}

    {step === 1 ? (
      <section className="block">
        <h2>수정 내용을 확인하세요</h2>
        <dl className="spec">
          <div>
            <dt>이름</dt>
            <dd>{name.trim() || "—"}</dd>
          </div>
          <div>
            <dt>생년월일</dt>
            <dd>{birthView(birth) || "—"}</dd>
          </div>
          <div>
            <dt>성별</dt>
            <dd>{genderLabel(toUiGender(gender))}</dd>
          </div>
          <div>
            <dt>휴대폰번호</dt>
            <dd>{formatPhone(phone) || "—"}</dd>
          </div>
          <div>
            <dt>이메일</dt>
            <dd>{email.trim() || "—"}</dd>
          </div>
          <div>
            <dt>주소</dt>
            <dd>{addressView || "—"}</dd>
          </div>
          <div>
            <dt>참가종목</dt>
            <dd>{category ? categoryLabel(category) : "—"}</dd>
          </div>
          <div>
            <dt>티셔츠 사이즈</dt>
            <dd>{selectedSize || "—"}</dd>
          </div>
          {guardianRequired ? (
            <div>
              <dt>보호자 동의</dt>
              <dd>{guardianConsent ? "동의함" : "—"}</dd>
            </div>
          ) : null}
        </dl>
        <DockNav>
          {hint || error ? (
            <p className="form__err flow__err" role="alert">
              {hint || error}
            </p>
          ) : null}
          <button
            type="button"
            className="btn btn--ghost"
            disabled={busy}
            onClick={() => {
              setPayCheckOpen(false);
              setStep(0);
              scrollPageTop();
            }}
          >
            수정
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            disabled={busy}
            onClick={() => runModify("submit")}
          >
            {busy && pendingAction === "submit" ? "제출 중..." : "수정된 신청서 제출"}
          </button>
          <button
            type="button"
            className="btn btn--red"
            disabled={busy}
            onClick={() => runModify("pay")}
          >
            {busy && pendingAction === "pay" ? "결제 준비 중..." : "결제하기"}
          </button>
        </DockNav>
      </section>
    ) : null}

    <RegisterPayCheckModal
      mode="lookup-modify"
      open={payCheckOpen}
      onClose={() => setPayCheckOpen(false)}
    />
    </>
  );
}

type GroupMemberDraft = Omit<OrganizationParticipantModifyRequest, "gender"> & {
  key: string;
  gender: "M" | "F" | "";
  eventCategoryName?: string;
  shirtSize?: string;
};

function memberKey() {
  return `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function groupMemberPeek(
  member: GroupMemberDraft,
  categories: RegistrationCategory[],
) {
  const name = member.name.trim() || "미입력";
  const category = findCategory(categories, member.eventCategoryId);
  if (!category) return name;
  return `${name} · ${categoryLabel(category)} · ${formatFee(categoryFeeAmount(category, member.birth))}`;
}

function emptyMember(): GroupMemberDraft {
  return {
    key: memberKey(),
    eventCategoryId: "",
    selectedSouvenirList: [],
    name: "",
    phNum: "",
    birth: "",
    gender: "",
  };
}

function participantPhone(row: OrganizationLookupParticipant) {
  return (row.phNum || row.phoneNumber || "").replace(/\D/g, "");
}

function participantDraft(
  row: OrganizationLookupParticipant,
): GroupMemberDraft {
  const selectedSouvenirList = souvenirSelections(row.selectedSouvenirList);
  return {
    key: row.registrationId || memberKey(),
    registrationId: row.registrationId,
    eventCategoryId: row.eventCategoryId || "",
    eventCategoryName: row.eventCategoryName || "",
    selectedSouvenirList,
    shirtSize:
      selectedSouvenirList.find((item) => item.selectedSize)?.selectedSize ||
      row.selectedSouvenirList?.[0]?.selectedSize ||
      row.selectedSouvenirList?.[0]?.size ||
      "",
    name: row.name,
    phNum: participantPhone(row),
    birth: (row.birth || "").replace(/\D/g, ""),
    gender: toApiGender(row.gender) || "M",
  };
}

export function GroupLookupEdit({
  receipt,
  access,
  busy,
  error,
  onBack,
  onSubmit,
}: {
  receipt: RegistrationReceipt;
  access: OrganizationLookupRequest;
  busy: boolean;
  error: string;
  onBack: () => void;
  onSubmit: (body: OrganizationRegistrationModifyRequest, action: LookupModifyAction) => void;
}) {
  const [step, setStep] = useState(0);
  const [payCheckOpen, setPayCheckOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<LookupModifyAction | null>(null);
  const [categories, setCategories] = useState<RegistrationCategory[]>([]);
  const [optionsError, setOptionsError] = useState("");
  const [members, setMembers] = useState<GroupMemberDraft[]>(() =>
    organizationLookupParticipants(receipt)
      .filter((row) => !row.canceled)
      .map(participantDraft),
  );
  const [openMember, setOpenMember] = useState(0);
  const [hint, setHint] = useState("");
  const [guardianConsent, setGuardianConsent] = useState(
    () => receipt.guardianConsent === true,
  );
  const [email, setEmail] = useState(receipt.email?.trim() || "");
  const optionsReady = categories.length > 0;
  const needsGroupGuardian = groupNeedsGuardian(members);
  const total = useMemo(
    () =>
      members.reduce((sum, member) => {
        const category = findCategory(categories, member.eventCategoryId);
        return sum + (category ? categoryFeeAmount(category, member.birth) : 0);
      }, 0),
    [categories, members],
  );

  useLayoutEffect(() => {
    scrollPageTop();
  }, []);

  useLayoutEffect(() => {
    if (step !== 0) scrollPageTop();
  }, [step]);

  useEffect(() => {
    if (!busy) setPendingAction(null);
  }, [busy]);

  useEffect(() => {
    let alive = true;
    fetchRegistrationOptions(DEFAULT_EVENT_ID)
      .then((data) => {
        if (!alive) return;
        setCategories(data.categories ?? []);
      })
      .catch(() => {
        if (!alive) return;
        setOptionsError("참가 옵션을 불러오지 못했습니다.");
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!categories.length) return;
    setMembers((rows) =>
      rows.map((member) => {
        let eventCategoryId = member.eventCategoryId;
        if (!eventCategoryId && member.eventCategoryName) {
          eventCategoryId =
            findCategoryByLabel(categories, member.eventCategoryName)?.categoryId ?? "";
        }
        if (!eventCategoryId) return member;
        const category = findCategory(categories, eventCategoryId);
        if (!category) return { ...member, eventCategoryId };
        const size = member.shirtSize || memberShirtSize(member.selectedSouvenirList, category);
        return {
          ...member,
          eventCategoryId,
          selectedSouvenirList: size
            ? withShirtSize(category, member.selectedSouvenirList, size, member.birth)
            : member.selectedSouvenirList.length
              ? member.selectedSouvenirList
              : selectionsForCategory(category, member.selectedSouvenirList),
        };
      }),
    );
  }, [categories]);

  function patchMember(index: number, next: Partial<GroupMemberDraft>) {
    setMembers((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...next } : row)),
    );
  }

  function addMember() {
    if (members.length >= MAX_GROUP_SIZE) {
      setHint(`한 번에 ${MAX_GROUP_SIZE}명까지 신청할 수 있습니다.`);
      return;
    }
    setHint("");
    setOpenMember(members.length);
    setMembers((rows) => [...rows, emptyMember()]);
  }

  function removeMember(index: number) {
    if (members.length <= 1) return;
    if (members[index]?.registrationId) return;
    setMembers((rows) => rows.filter((_, i) => i !== index));
    setOpenMember((prev) => {
      if (prev === index) return Math.max(0, index - 1);
      if (prev > index) return prev - 1;
      return prev;
    });
  }

  function validateForm() {
    if (!members.length) return "수정할 참가자가 없습니다.";
    for (let i = 0; i < members.length; i += 1) {
      const member = members[i];
      const prefix = `참가자 ${i + 1}: `;
      const category = findCategory(categories, member.eventCategoryId);
      const souvenir = shirtSouvenir(category);
      const invalid =
        personFormError(member.name, member.birth, member.phNum, member.gender) ||
        (!member.eventCategoryId ? "코스를 선택하세요." : "") ||
        (souvenir && !memberShirtSize(member.selectedSouvenirList, category)
          ? "티셔츠 사이즈를 선택하세요."
          : "");
      if (invalid) return `${prefix}${invalid}`;
    }
    if (needsGroupGuardian && !guardianConsent) {
      return "만 14세 미만 참가자가 있어 단체장 동의가 필요합니다.";
    }
    if (email.trim() && !emailOk(email)) return "이메일 형식을 확인하세요.";
    return "";
  }

  function buildPayload(): OrganizationRegistrationModifyRequest {
    return {
      access,
      guardianConsent: needsGroupGuardian ? guardianConsent : false,
      ...(email.trim() ? { email: email.trim() } : {}),
      registrations: members.map((row) => {
        const next: OrganizationParticipantModifyRequest = {
          eventCategoryId: row.eventCategoryId,
          selectedSouvenirList: row.selectedSouvenirList,
          name: row.name.trim(),
          phNum: toApiPhone(row.phNum),
          birth: toApiBirth(row.birth),
          gender: row.gender === "F" ? "F" : "M",
        };
        if (row.registrationId) next.registrationId = row.registrationId;
        return next;
      }),
    };
  }

  function goReview(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const invalid = validateForm();
    if (invalid) {
      setHint(invalid);
      return;
    }
    setHint("");
    setStep(1);
    setPayCheckOpen(true);
  }

  function runModify(action: LookupModifyAction) {
    setPendingAction(action);
    onSubmit(buildPayload(), action);
  }

  return (
    <>
    {step === 0 ? (
    <form className="form lookup-edit" onSubmit={goReview} noValidate>
      <div className="form__head">
        <h2>단체 접수 수정</h2>
        <p className="form__note">
          참가자 정보를 수정합니다. 인원을 추가하면 차액 결제가 필요할 수 있습니다.
        </p>
        <p className="lookup-edit__lock-note">
          이미 등록된 참가자의 개인정보(이름·생년월일·성별)와 연락처는 수정할 수 없습니다.
        </p>
      </div>
      <FormSec kicker="01 / CONTACT" title="연락처">
        <FormRow label="이메일">
          <EmailField value={email} onChange={setEmail} />
        </FormRow>
      </FormSec>
      <FormSec kicker="02" title="참가자">
        <div className="party-bar">
          <p>{members.length}명 등록</p>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={addMember}
            disabled={busy || members.length >= MAX_GROUP_SIZE}
          >
            참가자 추가
          </button>
        </div>
        {optionsError ? <p className="form__err">{optionsError}</p> : null}
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
              {members.map((member, index) => {
                const category = findCategory(categories, member.eventCategoryId);
                const souvenir = shirtSouvenir(category);
                const sizes = souvenirSizes(souvenir, ticketForBirth(member.birth));
                const courseId = category ? (courseForCategory(category)?.id ?? "") : "";
                const selectedSize = memberShirtSize(member.selectedSouvenirList, category);
                const open = openMember === index;
                const locked = Boolean(member.registrationId);
                return (
                  <Fragment key={member.key}>
                    <tr className={open ? "party__info is-open" : "party__info"}>
                      <td className="party__no" rowSpan={2}>
                        {index + 1}.
                      </td>
                      <td className="party__peek">
                        <button type="button" onClick={() => setOpenMember(index)}>
                          {groupMemberPeek(member, categories)}
                        </button>
                      </td>
                      <td data-label="이름" className={locked ? "is-locked" : undefined}>
                        <input
                          type="text"
                          placeholder="성명"
                          value={member.name}
                          onChange={(e) => patchMember(index, { name: e.target.value })}
                          required
                          disabled={locked}
                          readOnly={locked}
                        />
                      </td>
                      <td data-label="생년월일" className={locked ? "is-locked" : undefined}>
                        <BirthText
                          value={member.birth}
                          onChange={(birth) => {
                            if (locked) return;
                            const current = findCategory(categories, member.eventCategoryId);
                            const keep = current && categoryOpenForBirth(current, birth);
                            patchMember(
                              index,
                              keep
                                ? {
                                  birth,
                                  selectedSouvenirList: withShirtSize(
                                    current,
                                    member.selectedSouvenirList,
                                    memberShirtSize(member.selectedSouvenirList, current),
                                    birth,
                                  ),
                                }
                                : {
                                  birth,
                                  eventCategoryId: "",
                                  selectedSouvenirList: withShirtSize(
                                    undefined,
                                    member.selectedSouvenirList,
                                    "",
                                    birth,
                                  ),
                                },
                            );
                          }}
                          required
                          disabled={locked}
                        />
                      </td>
                      <td data-label="연락처" className={locked ? "is-locked" : undefined}>
                        <PhoneField
                          placeholder="연락처"
                          value={member.phNum}
                          onChange={(phNum) => patchMember(index, { phNum })}
                          required
                          disabled={locked}
                        />
                      </td>
                      <td data-label="성별" className={locked ? "is-locked" : undefined}>
                        <select
                          value={toUiGender(member.gender)}
                          onChange={(e) =>
                            patchMember(index, { gender: toApiGender(e.target.value) })
                          }
                          required
                          disabled={locked}
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
                        {category ? formatFee(categoryFeeAmount(category, member.birth)) : "—"}
                      </td>
                      <td className="party__del" rowSpan={2}>
                        <button
                          type="button"
                          className="party__expand"
                          onClick={() => setOpenMember(index)}
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
                          onClick={() => removeMember(index)}
                          disabled={
                            busy || Boolean(member.registrationId) || members.length <= 1
                          }
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                    <tr className={open ? "party__more is-open" : "party__more"}>
                      <td data-label="참가종목">
                        <select
                          value={member.eventCategoryId}
                          onChange={(e) => {
                            const eventCategoryId = e.target.value;
                            const next = findCategory(categories, eventCategoryId);
                            patchMember(index, {
                              eventCategoryId,
                              selectedSouvenirList: withShirtSize(
                                next,
                                member.selectedSouvenirList,
                                memberShirtSize(member.selectedSouvenirList, next),
                                member.birth,
                              ),
                            });
                          }}
                          disabled={!optionsReady}
                          required
                        >
                          <option value="">{optionsReady ? "참가종목" : "불러오는 중"}</option>
                          {categories.map((item) => {
                            const ageOff = !categoryOpenForBirth(item, member.birth);
                            const closed = item.isActive === false;
                            const reason = closed
                              ? "마감"
                              : ageOff
                                ? categoryClosedReason(item, member.birth)
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
                          value={selectedSize}
                          sizes={souvenir ? sizes : undefined}
                          disabled={!souvenir}
                          onChange={(size) =>
                            patchMember(index, {
                              selectedSouvenirList: withShirtSize(
                                category,
                                member.selectedSouvenirList,
                                size,
                                member.birth,
                              ),
                            })
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
        <FormSec kicker="03 / CONSENT" title="단체장 동의">
          <ApplyHint>
            <p>{GUARDIAN_AGE_NOTE}</p>
            <p>참가자 개개인 동의 대신 단체장 동의로 진행합니다.</p>
          </ApplyHint>
          <FormRow label="법정대리인 동의" required>
            <GuardianConsentField
              label={GROUP_GUARDIAN_CONSENT_LABEL}
              variant="button"
              agreed={guardianConsent}
              onChange={setGuardianConsent}
            />
          </FormRow>
        </FormSec>
      ) : null}
      {hint || error ? (
        <p className="form__err flow__err" role="alert">
          {hint || error}
        </p>
      ) : null}
      <div className="flow__nav">
        <button type="button" className="btn btn--ghost" onClick={onBack} disabled={busy}>
          돌아가기
        </button>
        <button type="submit" className="btn btn--red" disabled={busy || members.length === 0}>
          확인하기
        </button>
      </div>
    </form>
    ) : null}

    {step === 1 ? (
      <section className="block">
        <h2>수정 내용을 확인하세요</h2>
        <dl className="spec">
          <div>
            <dt>단체명</dt>
            <dd>{receipt.organizationName?.trim() || "—"}</dd>
          </div>
          <div>
            <dt>이메일</dt>
            <dd>{email.trim() || "—"}</dd>
          </div>
          <div>
            <dt>인원</dt>
            <dd>{members.length}명</dd>
          </div>
          <div>
            <dt>합계</dt>
            <dd>{formatFee(total)}</dd>
          </div>
          {needsGroupGuardian ? (
            <div>
              <dt>단체장 동의</dt>
              <dd>{guardianConsent ? "동의함" : "—"}</dd>
            </div>
          ) : null}
        </dl>
        <ul className="member-list">
          {members.map((member, i) => {
            const category = findCategory(categories, member.eventCategoryId);
            const courseId = category ? (courseForCategory(category)?.id ?? "") : "";
            const size = memberShirtSize(member.selectedSouvenirList, category);
            return (
              <li key={member.key}>
                <strong>
                  {String(i + 1).padStart(2, "0")} {member.name.trim() || "—"}
                </strong>
                <span>
                  {category ? categoryLabel(category) : "—"} · {size || "—"} ·{" "}
                  {birthView(member.birth) || "—"} ·{" "}
                  {genderLabel(member.gender === "F" ? "female" : "male")} ·{" "}
                  {formatPhone(member.phNum) || "—"}
                </span>
                <KitFixed courseId={courseId} />
              </li>
            );
          })}
        </ul>
        <DockNav>
          {hint || error ? (
            <p className="form__err flow__err" role="alert">
              {hint || error}
            </p>
          ) : null}
          <button
            type="button"
            className="btn btn--ghost"
            disabled={busy}
            onClick={() => {
              setPayCheckOpen(false);
              setStep(0);
              scrollPageTop();
            }}
          >
            수정
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            disabled={busy}
            onClick={() => runModify("submit")}
          >
            {busy && pendingAction === "submit" ? "제출 중..." : "수정된 신청서 제출"}
          </button>
          <button
            type="button"
            className="btn btn--red"
            disabled={busy}
            onClick={() => runModify("pay")}
          >
            {busy && pendingAction === "pay" ? "결제 준비 중..." : "결제하기"}
          </button>
        </DockNav>
      </section>
    ) : null}

    <RegisterPayCheckModal
      mode="lookup-modify"
      open={payCheckOpen}
      onClose={() => setPayCheckOpen(false)}
    />
    </>
  );
}
