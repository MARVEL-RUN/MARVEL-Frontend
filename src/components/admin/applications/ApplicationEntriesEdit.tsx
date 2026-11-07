"use client";

import { formatPhone } from "@/lib/register";
import { toApiGender } from "@/lib/registration-gender";
import {
  updateRegistrationEntries,
  type AdminRegistrationEntry,
  type RegistrationEntryUpdate,
} from "@/services/admin/applications";
import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent, type ReactNode } from "react";

type Draft = {
  entryId: string;
  categoryName: string;
  name: string;
  phNum: string;
  birth: string;
  gender: "M" | "F" | "";
};

type Props = {
  registrationId: string;
  entries: AdminRegistrationEntry[];
  onCancel: () => void;
  onSaved: () => void;
  onError: (message: string) => void;
};

const ENTRY_ERROR: Record<string, string> = {
  REGISTRATION_ENTRY_PACKAGE_ONLY: "패키지 신청만 참가자를 수정할 수 있습니다.",
  REGISTRATION_ENTRY_DUPLICATED: "같은 참가 항목을 두 번 보낼 수 없습니다.",
  INVALID_REGISTRATION_ENTRIES: "이 신청의 참가 항목이 아닙니다.",
  GUARDIAN_NAME_REQUIRED: "보호자 이름이 필요합니다.",
  GUARDIAN_CONSENT_REQUIRED: "보호자 동의가 필요합니다.",
  INVALID_REGISTRATION_BIRTH: "생년월일을 확인하세요.",
  REGISTRATION_CATEGORY_BIRTH_NOT_ALLOWED: "이 종목의 출생일 조건에 맞지 않습니다.",
  INVALID_REGISTRATION_MODIFICATION_TARGET: "삭제된 신청은 수정할 수 없습니다.",
  REGISTRATION_NOT_FOUND: "신청을 찾을 수 없습니다.",
};

function digits(value: string, max: number) {
  return value.replace(/\D/g, "").slice(0, max);
}

function toApiBirth(raw: string) {
  const birth = digits(raw, 8);
  if (birth.length !== 8) return "";
  return `${birth.slice(0, 4)}-${birth.slice(4, 6)}-${birth.slice(6, 8)}`;
}

function draftFromEntry(entry: AdminRegistrationEntry): Draft {
  return {
    entryId: entry.entryId,
    categoryName:
      [entry.productName, entry.categoryName || entry.eventCategoryId].filter(Boolean).join(" · ") ||
      "종목",
    name: entry.name.trim(),
    phNum: digits(entry.phNum, 14),
    birth: digits(entry.birth, 8),
    gender: toApiGender(entry.gender),
  };
}

function birthHint(raw: string) {
  const birth = digits(raw, 8);
  if (birth.length !== 8) return "YYYYMMDD 8자리";
  return `${birth.slice(0, 4)}.${birth.slice(4, 6)}.${birth.slice(6, 8)}`;
}

function rowIssue(row: Draft) {
  const label = row.categoryName;
  const name = row.name.trim();
  if (!name) return `${label} 이름을 입력하세요.`;
  if (name.length > 50) return `${label} 이름은 50자까지 입력할 수 있습니다.`;
  const phNum = digits(row.phNum, 14);
  if (!phNum || phNum.length > 14) return `${label} 연락처를 확인하세요.`;
  if (digits(row.birth, 8).length !== 8) return `${label} 생년월일 8자리를 입력하세요.`;
  if (row.gender !== "M" && row.gender !== "F") return `${label} 성별을 선택하세요.`;
  return "";
}

function toUpdate(row: Draft): RegistrationEntryUpdate | null {
  if (row.gender !== "M" && row.gender !== "F") return null;
  const birth = toApiBirth(row.birth);
  if (!birth) return null;
  return {
    entryId: row.entryId,
    name: row.name.trim(),
    phNum: digits(row.phNum, 14),
    birth,
    gender: row.gender,
  };
}

function sameEntry(row: Draft, initial: Draft) {
  return (
    row.name.trim() === initial.name.trim() &&
    digits(row.phNum, 14) === digits(initial.phNum, 14) &&
    digits(row.birth, 8) === digits(initial.birth, 8) &&
    row.gender === initial.gender
  );
}

function errorText(error: unknown) {
  const message = error instanceof Error ? error.message.trim() : "";
  if (message && ENTRY_ERROR[message]) return ENTRY_ERROR[message];
  if (message) return message;
  return "참가자 정보를 수정하지 못했습니다.";
}

export function ApplicationEntriesEdit({
  registrationId,
  entries,
  onCancel,
  onSaved,
  onError,
}: Props) {
  const initial = entries.map(draftFromEntry);
  const [rows, setRows] = useState<Draft[]>(initial);

  const save = useMutation({
    mutationFn: (body: RegistrationEntryUpdate[]) =>
      updateRegistrationEntries(registrationId, body),
    onSuccess: () => onSaved(),
    onError: (error) => onError(errorText(error)),
  });

  function patch(entryId: string, next: Partial<Draft>) {
    setRows((prev) => prev.map((row) => (row.entryId === entryId ? { ...row, ...next } : row)));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const changed = rows.filter((row, index) => !sameEntry(row, initial[index]));
    if (!changed.length) {
      onError("변경된 항목이 없습니다.");
      return;
    }
    const invalid = changed.map(rowIssue).find(Boolean);
    if (invalid) {
      onError(invalid);
      return;
    }
    const body = changed.flatMap((row) => {
      const update = toUpdate(row);
      return update ? [update] : [];
    });
    if (body.length !== changed.length) {
      onError("참가 항목 값을 확인하세요.");
      return;
    }
    onError("");
    save.mutate(body);
  }

  return (
    <form className="admin-drawer__edit" onSubmit={submit} noValidate>
      <p className="admin-drawer__edit-note">
        참가자의 이름·연락처·생년월일·성별만 수정됩니다. 배번은 바뀌지 않습니다.
      </p>
      {rows.map((row) => (
        <section key={row.entryId} className="admin-drawer__section">
          <h2 className="admin-drawer__section-title">{row.categoryName}</h2>
          <div className="admin-drawer__fields admin-drawer__edit-fields">
            <EditRow label="이름">
              <input
                className="admin-drawer__edit-input"
                value={row.name}
                maxLength={50}
                onChange={(e) => patch(row.entryId, { name: e.target.value })}
              />
            </EditRow>
            <EditRow label="연락처" hint={row.phNum ? formatPhone(row.phNum) : undefined}>
              <input
                className="admin-drawer__edit-input"
                inputMode="numeric"
                value={row.phNum}
                onChange={(e) => patch(row.entryId, { phNum: digits(e.target.value, 14) })}
              />
            </EditRow>
            <EditRow label="생년월일" hint={birthHint(row.birth)}>
              <input
                className="admin-drawer__edit-input"
                inputMode="numeric"
                value={row.birth}
                onChange={(e) => patch(row.entryId, { birth: digits(e.target.value, 8) })}
              />
            </EditRow>
            <EditRow label="성별">
              <select
                className="admin-drawer__edit-input admin-drawer__edit-select"
                value={row.gender}
                onChange={(e) =>
                  patch(row.entryId, { gender: e.target.value as Draft["gender"] })
                }
              >
                <option value="">선택</option>
                <option value="M">남성</option>
                <option value="F">여성</option>
              </select>
            </EditRow>
          </div>
        </section>
      ))}
      <div className="admin-drawer__edit-foot">
        <button type="button" className="admin-btn admin-btn--ghost" onClick={onCancel}>
          취소
        </button>
        <button type="submit" className="admin-btn" disabled={save.isPending}>
          {save.isPending ? "저장 중…" : "저장"}
        </button>
      </div>
    </form>
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
        {label}
        {hint ? <span className="admin-drawer__edit-hint">{hint}</span> : null}
      </div>
      <div className="admin-drawer__edit-value">{children}</div>
    </div>
  );
}
