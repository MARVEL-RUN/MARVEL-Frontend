"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { mainToast } from "@/components/main/feedback/MainFeedback";
import {
  AddressField,
  BirthText,
  FormRow,
  FormSec,
  GenderPick,
  GuardianConsentField,
  PhoneField,
  ShirtPick,
} from "@/components/main/register/ApplyUi";
import { formatAddressForApi } from "@/lib/daumPostcode";
import { hasMainApi, VIRTUAL_RUN_EVENT_ID } from "@/lib/main/config";
import { MainHttpError } from "@/lib/main/fetch";
import {
  lookupModifyAllowed,
  policyReasonMessage,
} from "@/lib/main/registrationActionPolicy";
import { findCategory, shirtSouvenir, souvenirSizes } from "@/lib/registration-options";
import { needsGuardian, type Gender } from "@/lib/register";
import { readLoginSession, writeLoginSession } from "@/lib/virtual-run/login-session";
import { saveVirtualRunTicketPending } from "@/lib/virtual-run/ticket-payment";
import { useRegistrationOptions } from "@/components/main/register/useRegistrationOptions";
import {
  lookupIndividualRegistrations,
  modifyIndividualRegistration,
} from "@/services/main/registrations";
import type {
  IndividualRegistrationModifyRequest,
  RegistrationReceipt,
  RegistrationSouvenirSelection,
} from "@/services/main/types";
import { useVirtualRunParticipant } from "../participant/VirtualRunParticipantProvider";
import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { VrLink, useVrPath } from "../layout/VrLink";
import { VrMypageGate } from "./VrMypageGate";

type Draft = {
  name: string;
  birth: string;
  phone: string;
  gender: Gender | "";
  zonecode: string;
  address: string;
  addressDetail: string;
  guardianName: string;
  guardianPhone: string;
  guardianRelation: string;
  guardianConsent: boolean;
  selectedSize: string;
};

function birthDigits(raw?: string | null) {
  return (raw ?? "").replace(/\D/g, "").slice(0, 8);
}

function toApiBirth(raw: string) {
  const digits = birthDigits(raw);
  if (digits.length !== 8) return raw.trim();
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

function toUiGender(raw?: string | null): Gender | "" {
  const key = (raw ?? "").trim().toUpperCase();
  if (key === "F" || key === "FEMALE") return "female";
  if (key === "M" || key === "MALE") return "male";
  return "";
}

function splitApiAddress(raw?: string | null) {
  const text = (raw ?? "").trim();
  const hit = text.match(/^\[(\d{5})\]\s*(.*)$/);
  if (hit) return { zonecode: hit[1], address: hit[2] };
  return { zonecode: "", address: text };
}

function editErrorMessage(err: unknown) {
  if (!(err instanceof Error)) return "신청 정보를 수정하지 못했습니다.";
  const message = err.message.trim();
  if (!message || message.length > 180) return "신청 정보를 수정하지 못했습니다.";
  if (err instanceof MainHttpError && err.status >= 500) return "신청 정보를 수정하지 못했습니다.";
  return message;
}

export function VirtualRunRegistrationEdit() {
  const router = useRouter();
  const toHref = useVrPath();
  const { participant, update } = useVirtualRunParticipant();
  const options = useRegistrationOptions(VIRTUAL_RUN_EVENT_ID);
  const [receipt, setReceipt] = useState<RegistrationReceipt | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (options.loading) return;
    const session = readLoginSession();
    if (!session || !hasMainApi || !VIRTUAL_RUN_EVENT_ID) {
      setLoading(false);
      setError(session ? "API 주소가 설정되지 않았습니다." : "");
      return;
    }
    let cancelled = false;
    lookupIndividualRegistrations(VIRTUAL_RUN_EVENT_ID, session.access)
      .then((found) => {
        if (cancelled) return;
        const rows = Array.isArray(found) ? found : [];
        const match =
          rows.find((row) => row.registrationId === session.registrationId) ??
          rows.find((row) => row.registrationId?.trim()) ??
          null;
        if (!match) {
          setError("신청 내역을 찾지 못했습니다. 다시 로그인해 주세요.");
          return;
        }
        const category = findCategory(options.categories, match.eventCategoryId || "");
        const souvenir = shirtSouvenir(category);
        const saved = (match.selectedSouvenirList ?? []).find(
          (row) => row.souvenirId === souvenir?.souvenirId,
        );
        const parsed = splitApiAddress(match.address);
        setReceipt(match);
        setDraft({
          name: match.name?.trim() || session.access.name,
          birth: birthDigits(match.birth),
          phone: (match.phNum ?? session.access.phNum).replace(/\D/g, ""),
          gender: toUiGender(match.gender),
          zonecode: parsed.zonecode,
          address: parsed.address,
          addressDetail: match.addressDetail?.trim() || "",
          guardianName: match.guardianName?.trim() || "",
          guardianPhone: (match.guardianPhNum ?? "").replace(/\D/g, ""),
          guardianRelation: match.guardianRelationship?.trim() || "",
          guardianConsent: match.guardianConsent === true,
          selectedSize: saved?.selectedSize || saved?.size || "",
        });
      })
      .catch((err) => {
        if (!cancelled) setError(editErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [options.loading, options.categories]);

  const category = findCategory(options.categories, receipt?.eventCategoryId || "");
  const souvenir = shirtSouvenir(category);
  const sizes = souvenir ? souvenirSizes(souvenir, draft ? birthDigits(draft.birth) : "") : [];
  const guardianOn = draft ? needsGuardian(draft.birth) : false;
  const canModify = receipt ? lookupModifyAllowed(receipt) : false;
  const blockedNote = receipt ? policyReasonMessage(receipt.userPolicy?.modifyReason) : "";

  function patch(next: Partial<Draft>) {
    setDraft((prev) => (prev ? { ...prev, ...next } : prev));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const session = readLoginSession();
    if (!session || !receipt || !draft || busy) return;
    if (!canModify) {
      setError(blockedNote || "현재 신청 정보를 수정할 수 없습니다.");
      return;
    }
    const name = draft.name.trim();
    const phNum = draft.phone.replace(/\D/g, "");
    if (!name) {
      setError("이름을 입력하세요.");
      return;
    }
    if (name.length > 50) {
      setError("이름은 50자까지 입력할 수 있습니다.");
      return;
    }
    if (birthDigits(draft.birth).length !== 8) {
      setError("생년월일을 입력하세요.");
      return;
    }
    if (phNum.length < 10 || phNum.length > 14) {
      setError("전화번호를 입력하세요.");
      return;
    }
    if (draft.gender !== "male" && draft.gender !== "female") {
      setError("성별을 선택하세요.");
      return;
    }
    if (options.addressRequired && !draft.address.trim()) {
      setError("배송 주소를 입력하세요.");
      return;
    }
    if (guardianOn && !draft.guardianName.trim()) {
      setError("만 14세 미만 참가자의 보호자 이름을 입력하세요.");
      return;
    }
    if (guardianOn && !draft.guardianConsent) {
      setError("만 14세 미만 참가자에 대한 보호자 동의가 필요합니다.");
      return;
    }
    if (!receipt.eventCategoryId) {
      setError("종목 정보를 확인하지 못했습니다.");
      return;
    }
    if (souvenir && sizes.length && !sizes.includes(draft.selectedSize)) {
      setError("티셔츠 사이즈를 선택하세요.");
      return;
    }

    const selectedSouvenirList: RegistrationSouvenirSelection[] = (
      receipt.selectedSouvenirList ?? []
    )
      .filter((row) => row.souvenirId)
      .map((row) => ({
        souvenirId: row.souvenirId,
        selectedSize:
          souvenir && row.souvenirId === souvenir.souvenirId
            ? draft.selectedSize
            : row.selectedSize || row.size || "",
      }));
    if (
      souvenir &&
      draft.selectedSize &&
      !selectedSouvenirList.some((row) => row.souvenirId === souvenir.souvenirId)
    ) {
      selectedSouvenirList.push({
        souvenirId: souvenir.souvenirId,
        selectedSize: draft.selectedSize,
      });
    }

    const startGroupUnselected = receipt.startGroupUnselected !== false || !receipt.startGroupId;
    const body: IndividualRegistrationModifyRequest = {
      access: session.access,
      eventCategoryId: receipt.eventCategoryId,
      selectedSouvenirList,
      name,
      phNum,
      birth: toApiBirth(draft.birth),
      gender: draft.gender === "female" ? "F" : "M",
      address: formatAddressForApi(draft.zonecode, draft.address),
      addressDetail: draft.addressDetail.trim(),
      ...(guardianOn && draft.guardianName.trim()
        ? { guardianName: draft.guardianName.trim() }
        : {}),
      ...(guardianOn && draft.guardianPhone.replace(/\D/g, "")
        ? { guardianPhNum: draft.guardianPhone.replace(/\D/g, "") }
        : {}),
      ...(guardianOn && draft.guardianRelation.trim()
        ? { guardianRelationship: draft.guardianRelation.trim() }
        : {}),
      guardianConsent: guardianOn ? draft.guardianConsent : false,
      ...(receipt.email?.trim() ? { email: receipt.email.trim() } : {}),
      startGroupId: startGroupUnselected ? null : receipt.startGroupId ?? null,
      startGroupUnselected,
    };

    setBusy(true);
    setError("");
    try {
      const settled = await modifyIndividualRegistration(
        VIRTUAL_RUN_EVENT_ID,
        receipt.registrationId || session.registrationId,
        body,
      );
      writeLoginSession({
        ...session,
        access: { ...session.access, name, birth: body.birth, phNum },
        categoryName: receipt.eventCategoryName?.trim() || session.categoryName,
      });
      if (participant) {
        update({
          ...participant,
          name,
          phone: phNum,
          categoryName: receipt.eventCategoryName?.trim() || participant.categoryName,
        });
      }
      const order = settled.orders?.find((row) => row.orderId && Number(row.amount) > 0);
      if (order) {
        saveVirtualRunTicketPending({
          registration: {
            orderId: order.orderId,
            orderName: order.orderName || "신청 정보 수정",
            paymentAmount: order.amount,
          },
          customerName: name,
          phone: phNum,
          kind: "single",
          roundIds: [],
          savedAt: Date.now(),
        });
        router.push(toHref("/payment"));
        return;
      }
      mainToast.success("신청 정보를 수정했습니다.");
      router.push(toHref("/mypage"));
    } catch (err) {
      setError(editErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <VirtualRunSubPage kicker="MY PAGE" title="신청 정보 수정" en="EDIT">
      <div className="page__body wrap wrap--narrow">
        <VrMypageGate>
          {loading || options.loading ? (
            <p className="form__note">신청 정보를 불러오는 중...</p>
          ) : !draft || !receipt ? (
            <section className="block wait">
              <h2>신청 정보를 열 수 없습니다</h2>
              {error ? <p className="sec__body">{error}</p> : null}
              <div className="flow__nav">
                <VrLink href="/mypage" className="btn btn--red">
                  마이페이지
                </VrLink>
              </div>
            </section>
          ) : (
            <form className="form" onSubmit={(e) => void onSubmit(e)} noValidate>
              <FormSec
                title="신청자"
                note="종목은 바꿀 수 없습니다. 패키지 참가자는 이 화면에서 수정하지 않습니다."
              >
                <FormRow label="보유 티켓" locked>
                  <p className="form-row__hint">
                    {receipt.eventCategoryName?.trim() || "종목 정보 없음"}
                  </p>
                </FormRow>
                <FormRow label="이름" required>
                  <input
                    name="name"
                    value={draft.name}
                    onChange={(e) => patch({ name: e.target.value })}
                    disabled={!canModify || busy}
                    maxLength={50}
                  />
                </FormRow>
                <FormRow label="생년월일" required>
                  <BirthText
                    name="birth"
                    value={draft.birth}
                    onChange={(birth) => patch({ birth })}
                    disabled={!canModify || busy}
                  />
                </FormRow>
                <FormRow label="전화번호" required>
                  <PhoneField
                    name="phone"
                    value={draft.phone}
                    onChange={(phone) => patch({ phone })}
                    disabled={!canModify || busy}
                  />
                </FormRow>
                <FormRow label="성별" required>
                  <GenderPick
                    name="gender"
                    value={draft.gender}
                    onChange={(gender) => patch({ gender })}
                    disabled={!canModify || busy}
                  />
                </FormRow>
                <FormRow label="배송 주소" required={options.addressRequired}>
                  <AddressField
                    zonecode={draft.zonecode}
                    address={draft.address}
                    addressDetail={draft.addressDetail}
                    onChange={(next) => patch(next)}
                    disabled={!canModify || busy}
                  />
                </FormRow>
                {sizes.length ? (
                  <FormRow label="티셔츠 사이즈" required>
                    <ShirtPick
                      value={draft.selectedSize}
                      onChange={(selectedSize) => patch({ selectedSize })}
                      sizes={sizes}
                      disabled={!canModify || busy}
                    />
                  </FormRow>
                ) : null}
                {guardianOn ? (
                  <>
                    <FormRow label="보호자 이름" required>
                      <input
                        name="guardianName"
                        value={draft.guardianName}
                        onChange={(e) => patch({ guardianName: e.target.value })}
                        disabled={!canModify || busy}
                      />
                    </FormRow>
                    <FormRow label="보호자 연락처">
                      <PhoneField
                        name="guardianPhone"
                        value={draft.guardianPhone}
                        onChange={(guardianPhone) => patch({ guardianPhone })}
                        disabled={!canModify || busy}
                      />
                    </FormRow>
                    <FormRow label="보호자 관계">
                      <input
                        name="guardianRelation"
                        value={draft.guardianRelation}
                        onChange={(e) => patch({ guardianRelation: e.target.value })}
                        disabled={!canModify || busy}
                      />
                    </FormRow>
                    <GuardianConsentField
                      agreed={draft.guardianConsent}
                      onChange={(guardianConsent) => patch({ guardianConsent })}
                      disabled={!canModify || busy}
                    />
                  </>
                ) : null}
              </FormSec>

              {!canModify ? (
                <p className="form__err" role="alert">
                  {blockedNote || "현재 신청 정보를 수정할 수 없습니다."}
                </p>
              ) : null}
              {error ? (
                <p className="form__err" role="alert">
                  {error}
                </p>
              ) : null}

              <div className="flow__nav">
                <VrLink href="/mypage" className="btn btn--ghost">
                  취소
                </VrLink>
                <button type="submit" className="btn btn--red" disabled={!canModify || busy}>
                  {busy ? "저장 중..." : "저장"}
                </button>
              </div>
            </form>
          )}
        </VrMypageGate>
      </div>
    </VirtualRunSubPage>
  );
}
