"use client";

import { toApiGender } from "@/lib/registration-gender";
import {
  updateRegistrationBasicInfo,
  type AdminApplicationRow,
  type RegistrationBasicInfoUpdate,
} from "@/services/admin/applications";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent } from "react";

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

function validate(form: FormState) {
  if (!form.name.trim()) return "이름을 입력하세요.";
  if (!form.phNum.trim()) return "연락처를 입력하세요.";
  const birthDigits = form.birth.replace(/\D/g, "");
  if (birthDigits.length !== 8) return "생년월일 8자리를 입력하세요.";
  if (form.gender !== "M" && form.gender !== "F") return "성별을 선택하세요.";
  if (!form.address.trim()) return "주소를 입력하세요.";
  if (!form.addressDetail.trim()) return "상세주소를 입력하세요.";
  return "";
}

function toPayload(form: FormState): RegistrationBasicInfoUpdate {
  return {
    name: form.name.trim(),
    phNum: form.phNum.replace(/\D/g, ""),
    birth: toApiBirth(form.birth),
    gender: form.gender as "M" | "F",
    address: form.address.trim(),
    addressDetail: form.addressDetail.trim(),
    guardianName: form.guardianName.trim(),
    guardianPhNum: form.guardianPhNum.replace(/\D/g, ""),
    guardianRelationship: form.guardianRelationship.trim(),
  };
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
    save.mutate();
  };

  return (
    <form className="admin-form admin-drawer__edit" onSubmit={submit} noValidate>
      <section className="admin-drawer__section">
        <h2 className="admin-drawer__section-title">기본정보 수정</h2>
        <label>
          이름
          <input
            className="admin-drawer__input"
            value={form.name}
            onChange={(e) => patch({ name: e.target.value })}
            autoComplete="name"
          />
        </label>
        <label>
          연락처
          <input
            className="admin-drawer__input"
            value={form.phNum}
            inputMode="numeric"
            onChange={(e) => patch({ phNum: e.target.value.replace(/\D/g, "") })}
            autoComplete="tel"
          />
        </label>
        <label>
          생년월일
          <input
            className="admin-drawer__input"
            value={form.birth}
            placeholder="YYYYMMDD"
            inputMode="numeric"
            onChange={(e) => patch({ birth: e.target.value.replace(/\D/g, "").slice(0, 8) })}
          />
        </label>
        <label>
          성별
          <select
            className="admin-drawer__input"
            value={form.gender}
            onChange={(e) => patch({ gender: e.target.value as FormState["gender"] })}
          >
            <option value="">선택</option>
            <option value="M">남성</option>
            <option value="F">여성</option>
          </select>
        </label>
        <label>
          주소
          <input
            className="admin-drawer__input"
            value={form.address}
            onChange={(e) => patch({ address: e.target.value })}
          />
        </label>
        <label>
          상세주소
          <input
            className="admin-drawer__input"
            value={form.addressDetail}
            onChange={(e) => patch({ addressDetail: e.target.value })}
          />
        </label>
      </section>

      <section className="admin-drawer__section">
        <h2 className="admin-drawer__section-title">보호자</h2>
        <label>
          이름
          <input
            className="admin-drawer__input"
            value={form.guardianName}
            onChange={(e) => patch({ guardianName: e.target.value })}
          />
        </label>
        <label>
          관계
          <input
            className="admin-drawer__input"
            value={form.guardianRelationship}
            onChange={(e) => patch({ guardianRelationship: e.target.value })}
          />
        </label>
        <label>
          연락처
          <input
            className="admin-drawer__input"
            value={form.guardianPhNum}
            inputMode="numeric"
            onChange={(e) => patch({ guardianPhNum: e.target.value.replace(/\D/g, "") })}
          />
        </label>
      </section>

      <div className="admin-drawer__foot">
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
