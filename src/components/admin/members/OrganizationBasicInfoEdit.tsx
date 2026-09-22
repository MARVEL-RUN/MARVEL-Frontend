"use client";

import { formatAdminBoardDate } from "@/lib/admin/formatDate";
import { emailOk, formatPhone } from "@/lib/register";
import { formatAmount } from "@/services/admin/applications";
import {
  updateOrganizationBasicInfo,
  type AdminOrganizationDetail,
  type OrganizationBasicInfoUpdate,
} from "@/services/admin/organizations";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";

export const ORG_BASIC_EDIT_FORM_ID = "org-basic-edit-form";

type Props = {
  detail: AdminOrganizationDetail;
  onSaved: () => void;
  onError: (message: string) => void;
  onPendingChange?: (pending: boolean) => void;
};

type FormState = {
  groupName: string;
  leaderName: string;
  leaderBirth: string;
  leaderPhNum: string;
  email: string;
  address: string;
  addressDetail: string;
  guardianConsent: boolean;
};

function formFromDetail(detail: AdminOrganizationDetail): FormState {
  return {
    groupName: detail.groupName.trim(),
    leaderName: detail.leaderName.trim(),
    leaderBirth: detail.leaderBirth.replace(/\D/g, "").slice(0, 8),
    leaderPhNum: formatPhone(detail.leaderPhNum),
    email: detail.email.trim(),
    address: detail.address.trim(),
    addressDetail: detail.addressDetail.trim(),
    guardianConsent: detail.guardianConsent === true,
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
  if (!form.groupName.trim()) return "단체명을 입력하세요.";
  if (!form.leaderName.trim()) return "대표자명을 입력하세요.";
  if (form.leaderBirth.replace(/\D/g, "").length !== 8) return "생년월일 8자리를 입력하세요.";
  if (form.leaderPhNum.replace(/\D/g, "").length < 10) return "대표자 연락처를 입력하세요.";
  if (form.email.trim() && !emailOk(form.email)) return "이메일 형식을 확인하세요.";
  if (!form.address.trim()) return "주소를 입력하세요.";
  if (!form.addressDetail.trim()) return "상세주소를 입력하세요.";
  return "";
}

function toPayload(form: FormState): OrganizationBasicInfoUpdate {
  return {
    groupName: form.groupName.trim(),
    leaderName: form.leaderName.trim(),
    leaderBirth: toApiBirth(form.leaderBirth),
    leaderPhNum: formatPhone(form.leaderPhNum),
    ...(form.email.trim() ? { email: form.email.trim() } : {}),
    address: form.address.trim(),
    addressDetail: form.addressDetail.trim(),
    guardianConsent: form.guardianConsent,
  };
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
    <div className="admin-org-detail__row">
      <dt>
        {label}
        {hint ? <span className="admin-org-detail__hint">{hint}</span> : null}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}

function ReadRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="admin-org-detail__row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function dash(value?: string | number | null) {
  if (value == null || value === "") return "-";
  const text = String(value).trim();
  return text || "-";
}

export function OrganizationBasicInfoEdit({
  detail,
  onSaved,
  onError,
  onPendingChange,
}: Props) {
  const initial = useMemo(() => formFromDetail(detail), [detail]);
  const [form, setForm] = useState(initial);
  const members = detail.members ?? [];
  const totalAmount = members.reduce((sum, member) => sum + (member.amount || 0), 0);

  const save = useMutation({
    mutationFn: () => updateOrganizationBasicInfo(detail.organizationId, toPayload(form)),
    onSuccess: () => onSaved(),
    onError: (err) =>
      onError(err instanceof Error ? err.message : "기본정보 수정에 실패했습니다."),
  });

  useEffect(() => {
    onPendingChange?.(save.isPending);
  }, [onPendingChange, save.isPending]);

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

  return (
    <form
      id={ORG_BASIC_EDIT_FORM_ID}
      className="admin-org-detail__summary admin-org-detail__summary--edit"
      onSubmit={submit}
      noValidate
    >
      <p className="admin-org-detail__edit-note">
        대표 이메일·단체 주소는 구성원 전원에게 적용됩니다. 참가자별 이름·연락처 등은
        아래 구성원 목록에서 수정하세요.
      </p>
      <section className="admin-org-detail__card">
        <h2>기본 정보</h2>
        <dl>
          <EditRow label="단체명">
            <input
              className="admin-org-detail__input"
              value={form.groupName}
              onChange={(e) => patch({ groupName: e.target.value.replace(/\s/g, "") })}
            />
          </EditRow>
          <EditRow label="대표자명">
            <input
              className="admin-org-detail__input"
              value={form.leaderName}
              onChange={(e) => patch({ leaderName: e.target.value })}
              autoComplete="name"
            />
          </EditRow>
          <EditRow label="대표자 생년월일" hint={birthHint(form.leaderBirth)}>
            <input
              className="admin-org-detail__input"
              value={form.leaderBirth}
              placeholder="YYYYMMDD"
              inputMode="numeric"
              onChange={(e) =>
                patch({ leaderBirth: e.target.value.replace(/\D/g, "").slice(0, 8) })
              }
            />
          </EditRow>
          <EditRow label="대표자 연락처">
            <input
              className="admin-org-detail__input"
              type="tel"
              value={form.leaderPhNum}
              inputMode="numeric"
              placeholder="010-1234-5678"
              maxLength={13}
              onChange={(e) => patch({ leaderPhNum: formatPhone(e.target.value) })}
              autoComplete="tel"
            />
          </EditRow>
          <ReadRow label="대표 아이디" value={dash(detail.loginId)} />
          <EditRow label="대표 이메일">
            <input
              className="admin-org-detail__input"
              type="email"
              value={form.email}
              placeholder="없으면 비워두세요"
              onChange={(e) => patch({ email: e.target.value })}
              autoComplete="email"
            />
          </EditRow>
          <EditRow label="법정대리인 동의">
            <label className="admin-org-detail__consent">
              <input
                type="checkbox"
                checked={form.guardianConsent}
                onChange={(e) => patch({ guardianConsent: e.target.checked })}
              />
              <span>동의함</span>
            </label>
          </EditRow>
        </dl>
      </section>

      <section className="admin-org-detail__card">
        <h2>주소</h2>
        <dl>
          <EditRow label="주소">
            <input
              className="admin-org-detail__input"
              value={form.address}
              onChange={(e) => patch({ address: e.target.value })}
            />
          </EditRow>
          <EditRow label="상세주소">
            <input
              className="admin-org-detail__input"
              value={form.addressDetail}
              onChange={(e) => patch({ addressDetail: e.target.value })}
            />
          </EditRow>
        </dl>
      </section>

      <section className="admin-org-detail__card admin-org-detail__card--readonly">
        <h2>신청 정보</h2>
        <dl>
          <ReadRow label="신청일시" value={formatAdminBoardDate(detail.createdAt)} />
          <ReadRow label="대회명" value={dash(detail.eventName)} />
          <ReadRow
            label="총 구성원"
            value={members.length > 0 ? `${members.length}명` : "-"}
          />
        </dl>
      </section>

      <section className="admin-org-detail__card admin-org-detail__card--readonly">
        <h2>결제 정보</h2>
        <dl>
          <ReadRow
            label="총 금액"
            value={totalAmount > 0 ? formatAmount(totalAmount) : "-"}
          />
        </dl>
      </section>
    </form>
  );
}
