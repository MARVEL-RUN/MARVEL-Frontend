"use client";

import { emailOk, formatPhone } from "@/lib/register";
import { toApiGender } from "@/lib/registration-gender";
import { findCategory } from "@/lib/registration-options";
import {
  findStartGroup,
  hasStartGroupFeature,
  sortedStartGroups,
  startGroupDraftError,
  startGroupDraftFromStored,
  startGroupInputFromDraft,
  startGroupInputFromStored,
  startGroupSelectionChanged,
  type StartGroupDraft,
} from "@/lib/start-group";
import {
  updateRegistrationBasicInfo,
  type AdminApplicationRow,
  type RegistrationBasicInfoUpdate,
} from "@/services/admin/applications";
import { fetchAdminRegistrationOptions } from "@/services/admin/registration-options";
import type { RegistrationCategory } from "@/services/main/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";

const DEFER_VALUE = "__defer";

export type ApplicationBasicInfoEditMode = "full" | "organization-member";

type Props = {
  row: AdminApplicationRow;
  mode?: ApplicationBasicInfoEditMode;
  onCancel: () => void;
  onSaved: () => void;
  onError: (message: string) => void;
  onOpenGroupBasicInfo?: () => void;
};

type FormState = {
  name: string;
  phNum: string;
  birth: string;
  gender: "M" | "F" | "";
  email: string;
  address: string;
  addressDetail: string;
  guardianName: string;
  guardianPhNum: string;
  guardianRelationship: string;
  startGroup: StartGroupDraft;
};

function editableText(value?: string | null) {
  const text = (value ?? "").trim();
  if (!text || text === "-" || text === "—") return "";
  return text;
}

function formFromRow(row: AdminApplicationRow): FormState {
  const address = row.leader?.address || row.address || "";
  const addressDetail = row.leader?.addressDetail || row.addressDetail || "";
  return {
    name: row.personName?.trim() || row.name?.trim() || "",
    phNum: (row.phone ?? "").replace(/\D/g, ""),
    birth: (row.birth ?? "").replace(/\D/g, "").slice(0, 8),
    gender: toApiGender(row.gender),
    email: editableText(row.email),
    address: address.trim(),
    addressDetail: addressDetail.trim(),
    guardianName: row.guardianName?.trim() ?? "",
    guardianPhNum: (row.guardianPhone ?? "").replace(/\D/g, ""),
    guardianRelationship: row.guardianRelation?.trim() ?? "",
    startGroup: startGroupDraftFromStored(row.startGroupId, row.startGroupUnselected),
  };
}

function toApiBirth(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  }
  return raw.trim();
}

function birthHint(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 8) return "YYYYMMDD 8자리";
  return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}`;
}

function validate(
  form: FormState,
  initial: FormState,
  category: RegistrationCategory | undefined,
) {
  if (!form.name.trim()) return "이름을 입력하세요.";
  if (!form.phNum.trim()) return "연락처를 입력하세요.";
  if (form.birth.replace(/\D/g, "").length !== 8) return "생년월일 8자리를 입력하세요.";
  if (form.gender !== "M" && form.gender !== "F") return "성별을 선택하세요.";
  if (!form.address.trim()) return "주소를 입력하세요.";
  if (!form.addressDetail.trim()) return "상세주소를 입력하세요.";
  const email = editableText(form.email);
  if (email && !emailOk(email)) return "이메일 형식을 확인하세요.";
  const stored = startGroupInputFromDraft(initial.startGroup);
  const storedEmpty = !stored.startGroupUnselected && !stored.startGroupId;
  // 그대로 둔 저장값은 선택지 조회 실패·비활성 그룹이어도 서버 판단에 맡김
  if (storedEmpty || startGroupSelectionChanged(stored, form.startGroup)) {
    const groupErr = startGroupDraftError(form.startGroup, category);
    if (groupErr) return groupErr;
  }
  return "";
}

function toPayload(
  form: FormState,
  row: AdminApplicationRow,
): RegistrationBasicInfoUpdate {
  const email = editableText(form.email);
  return {
    name: form.name.trim(),
    phNum: form.phNum.replace(/\D/g, ""),
    birth: toApiBirth(form.birth),
    gender: form.gender as "M" | "F",
    ...(email ? { email } : {}),
    address: form.address.trim(),
    addressDetail: form.addressDetail.trim(),
    guardianName: form.guardianName.trim(),
    guardianPhNum: form.guardianPhNum.replace(/\D/g, ""),
    guardianRelationship: form.guardianRelationship.trim(),
    ...(hasStartGroupFeature
      ? startGroupInputFromDraft(form.startGroup)
      : startGroupInputFromStored(row.startGroupId, row.startGroupUnselected)),
  };
}

function EditSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="admin-drawer__section">
      <h2 className="admin-drawer__section-title">{title}</h2>
      <div className="admin-drawer__fields admin-drawer__edit-fields">{children}</div>
    </section>
  );
}

function EditRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="admin-drawer__edit-row">
      <div className="admin-drawer__edit-label">
        <span>{label}</span>
        {hint ? <span className="admin-drawer__edit-hint">{hint}</span> : null}
      </div>
      <div className="admin-drawer__edit-value">{children}</div>
    </div>
  );
}

export function ApplicationBasicInfoEdit({
  row,
  mode = "full",
  onCancel,
  onSaved,
  onError,
  onOpenGroupBasicInfo,
}: Props) {
  const initial = useMemo(() => formFromRow(row), [row]);
  const [form, setForm] = useState(initial);
  const lockSharedFields = mode === "organization-member";

  const options = useQuery({
    queryKey: ["admin", "registration-options", row.eventId],
    queryFn: () => fetchAdminRegistrationOptions(row.eventId),
    enabled: Boolean(row.eventId),
  });
  const category = findCategory(options.data?.categories ?? [], row.eventCategoryId ?? "");
  const groups = sortedStartGroups(category);
  const storedGroupMissing =
    options.isSuccess &&
    !form.startGroup.startGroupUnselected &&
    Boolean(form.startGroup.startGroupId) &&
    !findStartGroup(category, form.startGroup.startGroupId);
  const startGroupValue = form.startGroup.startGroupUnselected
    ? DEFER_VALUE
    : storedGroupMissing
      ? ""
      : form.startGroup.startGroupId;
  const startGroupPlaceholder = options.isLoading
    ? "불러오는 중…"
    : options.isError
      ? "선택지를 불러오지 못했습니다"
      : groups.length
        ? "선택"
        : "선택 가능한 출발 그룹이 없습니다";
  const startGroupHint = storedGroupMissing
    ? `저장된 그룹${row.startGroupCode ? `(${row.startGroupCode})` : ""}이 선택지에 없습니다. 다시 선택하세요.`
    : options.isError
      ? "현재 저장값으로 유지됩니다"
      : row.courseName?.trim() || undefined;

  const save = useMutation({
    mutationFn: () => updateRegistrationBasicInfo(row.id, toPayload(form, row)),
    onSuccess: () => onSaved(),
    onError: (err) =>
      onError(err instanceof Error ? err.message : "기본정보 수정에 실패했습니다."),
  });

  const patch = (next: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...next }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const invalid = storedGroupMissing
      ? "출발 그룹을 다시 선택하세요."
      : validate(form, initial, category);
    if (invalid) {
      onError(invalid);
      return;
    }
    onError("");
    save.mutate();
  };

  const phonePreview = form.phNum ? formatPhone(form.phNum) : "";
  const guardianPhonePreview = form.guardianPhNum ? formatPhone(form.guardianPhNum) : "";

  return (
    <form className="admin-drawer__edit" onSubmit={submit} noValidate>
      {lockSharedFields ? (
        <div className="admin-drawer__guide" role="note">
          <p>
            이름·연락처·생년월일·성별·보호자
            {hasStartGroupFeature ? "·출발 그룹" : ""}만 수정할 수 있습니다.
            <br />
            이메일·주소는 단체 상세의 「기본정보 수정」에서 변경해 주세요.
          </p>
          {onOpenGroupBasicInfo ? (
            <div className="admin-drawer__guide-action">
              <button
                type="button"
                className="admin-drawer__guide-link"
                onClick={onOpenGroupBasicInfo}
              >
                기본정보 수정 바로가기
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="admin-drawer__edit-note">
          신청자·주소·보호자{hasStartGroupFeature ? "·출발 그룹" : ""}만 수정됩니다. 코스·기념품·
          결제 정보는 변경되지 않습니다.
        </p>
      )}

      <EditSection title="신청 정보">
        {hasStartGroupFeature ? (
          <EditRow label="출발 그룹" hint={startGroupHint}>
            <select
              className="admin-drawer__edit-input admin-drawer__edit-select"
              value={startGroupValue}
              disabled={!groups.length}
              onChange={(e) => {
                const next = e.target.value;
                patch({
                  startGroup:
                    next === DEFER_VALUE
                      ? { startGroupId: "", startGroupUnselected: true }
                      : { startGroupId: next, startGroupUnselected: false },
                });
              }}
            >
              <option value="">{startGroupPlaceholder}</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.code} · {group.description}
                </option>
              ))}
              {groups.length ? (
                <option value={DEFER_VALUE}>미선택 (후미 그룹 배정)</option>
              ) : null}
            </select>
          </EditRow>
        ) : null}
      </EditSection>

      <EditSection title={lockSharedFields || row.kind === "group" ? "참가자" : "신청자"}>
        <EditRow label="이름">
          <input
            className="admin-drawer__edit-input"
            value={form.name}
            onChange={(e) => patch({ name: e.target.value })}
            autoComplete="name"
          />
        </EditRow>
        <EditRow label="연락처" hint={phonePreview || undefined}>
          <input
            className="admin-drawer__edit-input"
            value={form.phNum}
            inputMode="numeric"
            placeholder="숫자만 입력"
            onChange={(e) => patch({ phNum: e.target.value.replace(/\D/g, "").slice(0, 11) })}
            autoComplete="tel"
          />
        </EditRow>
        <EditRow label="생년월일" hint={birthHint(form.birth)}>
          <input
            className="admin-drawer__edit-input"
            value={form.birth}
            placeholder="YYYYMMDD"
            inputMode="numeric"
            onChange={(e) => patch({ birth: e.target.value.replace(/\D/g, "").slice(0, 8) })}
          />
        </EditRow>
        <EditRow label="성별">
          <select
            className="admin-drawer__edit-input admin-drawer__edit-select"
            value={form.gender}
            onChange={(e) => patch({ gender: e.target.value as FormState["gender"] })}
          >
            <option value="">선택</option>
            <option value="M">남성</option>
            <option value="F">여성</option>
          </select>
        </EditRow>
        <EditRow
          label="이메일"
          hint={lockSharedFields ? "단체 공통 정보" : undefined}
        >
          <input
            className="admin-drawer__edit-input"
            type="email"
            value={form.email}
            placeholder="없으면 비워두세요"
            readOnly={lockSharedFields}
            disabled={lockSharedFields}
            onChange={(e) => patch({ email: e.target.value })}
            autoComplete="email"
          />
        </EditRow>
      </EditSection>

      <EditSection title="주소">
        <EditRow label="주소" hint={lockSharedFields ? "단체 공통 정보" : undefined}>
          <input
            className="admin-drawer__edit-input"
            value={form.address}
            readOnly={lockSharedFields}
            disabled={lockSharedFields}
            onChange={(e) => patch({ address: e.target.value })}
          />
        </EditRow>
        <EditRow
          label="상세주소"
          hint={lockSharedFields ? "단체 공통 정보" : undefined}
        >
          <input
            className="admin-drawer__edit-input"
            value={form.addressDetail}
            readOnly={lockSharedFields}
            disabled={lockSharedFields}
            onChange={(e) => patch({ addressDetail: e.target.value })}
          />
        </EditRow>
      </EditSection>

      <EditSection title="보호자">
        <EditRow label="이름">
          <input
            className="admin-drawer__edit-input"
            value={form.guardianName}
            placeholder="없으면 비워두세요"
            onChange={(e) => patch({ guardianName: e.target.value })}
          />
        </EditRow>
        <EditRow label="관계">
          <input
            className="admin-drawer__edit-input"
            value={form.guardianRelationship}
            placeholder="없으면 비워두세요"
            onChange={(e) => patch({ guardianRelationship: e.target.value })}
          />
        </EditRow>
        <EditRow label="연락처" hint={guardianPhonePreview || undefined}>
          <input
            className="admin-drawer__edit-input"
            value={form.guardianPhNum}
            inputMode="numeric"
            placeholder="숫자만 입력"
            onChange={(e) =>
              patch({ guardianPhNum: e.target.value.replace(/\D/g, "").slice(0, 11) })
            }
          />
        </EditRow>
      </EditSection>

      <div className="admin-drawer__edit-foot">
        <button
          type="button"
          className="admin-btn admin-btn--ghost"
          disabled={save.isPending}
          onClick={onCancel}
        >
          취소
        </button>
        <button type="submit" className="admin-btn admin-btn--primary" disabled={save.isPending}>
          {save.isPending ? "저장 중…" : "저장"}
        </button>
      </div>
    </form>
  );
}
