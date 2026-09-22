"use client";

import { emailOk, formatPhone } from "@/lib/register";
import { toApiGender } from "@/lib/registration-gender";
import {
  updateRegistrationBasicInfo,
  type AdminApplicationRow,
  type RegistrationBasicInfoUpdate,
} from "@/services/admin/applications";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";

type Props = {
  row: AdminApplicationRow;
  onCancel: () => void;
  onSaved: () => void;
  onError: (message: string) => void;
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
};

function formFromRow(row: AdminApplicationRow): FormState {
  const address = row.leader?.address || row.address || "";
  const addressDetail = row.leader?.addressDetail || row.addressDetail || "";
  return {
    name: row.personName?.trim() || row.name?.trim() || "",
    phNum: (row.phone ?? "").replace(/\D/g, ""),
    birth: (row.birth ?? "").replace(/\D/g, "").slice(0, 8),
    gender: toApiGender(row.gender),
    email: row.email?.trim() ?? "",
    address: address.trim(),
    addressDetail: addressDetail.trim(),
    guardianName: row.guardianName?.trim() ?? "",
    guardianPhNum: (row.guardianPhone ?? "").replace(/\D/g, ""),
    guardianRelationship: row.guardianRelation?.trim() ?? "",
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

function validate(form: FormState) {
  if (!form.name.trim()) return "이름을 입력하세요.";
  if (!form.phNum.trim()) return "연락처를 입력하세요.";
  if (form.birth.replace(/\D/g, "").length !== 8) return "생년월일 8자리를 입력하세요.";
  if (form.gender !== "M" && form.gender !== "F") return "성별을 선택하세요.";
  if (!form.address.trim()) return "주소를 입력하세요.";
  if (!form.addressDetail.trim()) return "상세주소를 입력하세요.";
  if (form.email.trim() && !emailOk(form.email)) return "이메일 형식을 확인하세요.";
  return "";
}

function toPayload(form: FormState): RegistrationBasicInfoUpdate {
  return {
    name: form.name.trim(),
    phNum: form.phNum.replace(/\D/g, ""),
    birth: toApiBirth(form.birth),
    gender: form.gender as "M" | "F",
    ...(form.email.trim() ? { email: form.email.trim() } : {}),
    address: form.address.trim(),
    addressDetail: form.addressDetail.trim(),
    guardianName: form.guardianName.trim(),
    guardianPhNum: form.guardianPhNum.replace(/\D/g, ""),
    guardianRelationship: form.guardianRelationship.trim(),
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

export function ApplicationBasicInfoEdit({ row, onCancel, onSaved, onError }: Props) {
  const initial = useMemo(() => formFromRow(row), [row]);
  const [form, setForm] = useState(initial);

  const save = useMutation({
    mutationFn: () => updateRegistrationBasicInfo(row.id, toPayload(form)),
    onSuccess: () => onSaved(),
    onError: (err) =>
      onError(err instanceof Error ? err.message : "기본정보 수정에 실패했습니다."),
  });

  const patch = (next: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...next }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const invalid = validate(form);
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
      <p className="admin-drawer__edit-note">
        신청자·주소·보호자 정보만 수정됩니다. 코스·기념품·결제 정보는 변경되지 않습니다.
      </p>

      <EditSection title={row.kind === "group" ? "참가자" : "신청자"}>
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
        <EditRow label="이메일">
          <input
            className="admin-drawer__edit-input"
            type="email"
            value={form.email}
            placeholder="없으면 비워두세요"
            onChange={(e) => patch({ email: e.target.value })}
            autoComplete="email"
          />
        </EditRow>
      </EditSection>

      <EditSection title="주소">
        <EditRow label="주소">
          <input
            className="admin-drawer__edit-input"
            value={form.address}
            onChange={(e) => patch({ address: e.target.value })}
          />
        </EditRow>
        <EditRow label="상세주소">
          <input
            className="admin-drawer__edit-input"
            value={form.addressDetail}
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
