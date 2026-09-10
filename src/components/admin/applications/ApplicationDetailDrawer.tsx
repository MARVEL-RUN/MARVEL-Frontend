"use client";

import { useAdminConfirm } from "@/components/admin/ConfirmModal";
import { useAdminPrompt } from "@/components/admin/InputModal";
import { adminToast } from "@/components/admin/Toast";
import { EVENT } from "@/lib/event";
import { SHIRT_SIZES, type CourseId } from "@/lib/register";
import type { VirtualRoundId } from "@/lib/admin/raceEvents";
import {
  applicationCourseLabel,
  applicationGenderLabel,
  applicationPayLabel,
  formatAmount,
  type AdminApplicationRow,
} from "@/services/admin/applications";
import type { AdminPayStatus } from "@/types/admin";
import { useEffect, useState, type ReactNode } from "react";

type Props = {
  row: AdminApplicationRow | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onSave?: (row: AdminApplicationRow) => void;
};

function dash(value?: string) {
  return value?.trim() ? value : "-";
}

function FieldInput({
  value,
  onChange,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <input
      className="admin-cell-input admin-drawer__input"
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function FieldSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <select
      className="admin-cell-input admin-cell-input--select admin-drawer__input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

const STATUS_OPTIONS: { value: AdminPayStatus; label: string }[] = [
  { value: "paid", label: "결제완료" },
  { value: "pending", label: "미결제" },
  { value: "refund_requested", label: "환불신청" },
  { value: "refunded", label: "환불완료" },
];

const COURSE_OPTIONS = EVENT.courses.map((course) => ({
  value: course.id,
  label: course.distance,
}));

const ROUND_OPTIONS: { value: VirtualRoundId; label: string }[] = [
  { value: "1", label: "1차" },
  { value: "2", label: "2차" },
  { value: "3", label: "3차" },
];

const SIZE_OPTIONS = SHIRT_SIZES.map((size) => ({ value: size, label: size }));

function syncDisplayName(next: AdminApplicationRow): AdminApplicationRow {
  const name =
    next.kind === "group"
      ? next.groupName.trim() || next.personName.trim() || next.name
      : next.personName.trim() || next.name;
  return { ...next, name };
}

export function ApplicationDetailDrawer({ row, onClose, onDelete, onSave }: Props) {
  const { confirm, modal: confirmModal } = useAdminConfirm();
  const { prompt, modal: promptModal } = useAdminPrompt();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<AdminApplicationRow | null>(null);

  useEffect(() => {
    setEditing(false);
    setDraft(null);
  }, [row?.id]);

  if (!row) return null;

  const view = editing && draft ? draft : row;
  const locked = !editing;

  const patch = (partial: Partial<AdminApplicationRow>) => {
    setDraft((prev) => (prev ? { ...prev, ...partial } : prev));
  };

  const startEdit = () => {
    setDraft({ ...row });
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft(null);
    setEditing(false);
  };

  const saveEdit = () => {
    if (!draft) return;
    const next = syncDisplayName(draft);
    onSave?.(next);
    setDraft(null);
    setEditing(false);
    adminToast.success("신청 정보가 저장되었습니다.");
  };

  const requestClose = () => {
    if (editing) cancelEdit();
    onClose();
  };

  const fields: { label: string; value: ReactNode }[] = [
    {
      label: "성명",
      value: locked ? (
        dash(view.personName)
      ) : (
        <FieldInput value={view.personName} onChange={(v) => patch({ personName: v })} />
      ),
    },
    {
      label: "단체명",
      value: locked ? (
        dash(view.groupName)
      ) : (
        <FieldInput value={view.groupName} onChange={(v) => patch({ groupName: v })} />
      ),
    },
    {
      label: view.round ? "차수" : "코스",
      value: locked ? (
        applicationCourseLabel(view)
      ) : view.round ? (
        <FieldSelect
          value={view.round}
          options={ROUND_OPTIONS}
          onChange={(v) => patch({ round: v as VirtualRoundId })}
        />
      ) : (
        <FieldSelect
          value={view.courseId ?? ""}
          options={COURSE_OPTIONS}
          onChange={(v) => patch({ courseId: v as CourseId })}
        />
      ),
    },
    {
      label: "기념품",
      value: locked ? (
        dash(view.souvenir)
      ) : (
        <FieldInput value={view.souvenir} onChange={(v) => patch({ souvenir: v })} />
      ),
    },
    {
      label: "사이즈",
      value: locked ? (
        dash(view.size)
      ) : (
        <FieldSelect
          value={view.size}
          options={SIZE_OPTIONS}
          onChange={(v) => patch({ size: v })}
        />
      ),
    },
    {
      label: "성별",
      value: locked ? (
        applicationGenderLabel(view.gender)
      ) : (
        <FieldSelect
          value={view.gender ?? "male"}
          options={[
            { value: "male", label: "남성" },
            { value: "female", label: "여성" },
          ]}
          onChange={(v) => patch({ gender: v as "male" | "female" })}
        />
      ),
    },
    {
      label: "생년월일",
      value: locked ? (
        dash(view.birth)
      ) : (
        <FieldInput value={view.birth ?? ""} onChange={(v) => patch({ birth: v })} />
      ),
    },
    {
      label: "연락처",
      value: locked ? (
        dash(view.phone)
      ) : (
        <FieldInput value={view.phone} onChange={(v) => patch({ phone: v })} />
      ),
    },
    {
      label: "보호자 연락처",
      value: locked ? (
        dash(view.guardianPhone)
      ) : (
        <FieldInput value={view.guardianPhone} onChange={(v) => patch({ guardianPhone: v })} />
      ),
    },
    {
      label: "보호자 관계",
      value: locked ? (
        dash(view.guardianRelation)
      ) : (
        <FieldInput
          value={view.guardianRelation}
          onChange={(v) => patch({ guardianRelation: v })}
        />
      ),
    },
    { label: "신청일시", value: view.appliedAt },
    {
      label: "금액",
      value: locked ? (
        formatAmount(view.amount)
      ) : (
        <FieldInput
          type="number"
          value={String(view.amount)}
          onChange={(v) => patch({ amount: Number(v) || 0 })}
        />
      ),
    },
    { label: "주문번호", value: view.orderNo },
    {
      label: "카드결제정보",
      value: locked ? (
        dash(view.cardPaymentInfo)
      ) : (
        <FieldInput
          value={view.cardPaymentInfo}
          onChange={(v) => patch({ cardPaymentInfo: v })}
        />
      ),
    },
    {
      label: "결제여부",
      value: locked ? (
        <span className={`admin-badge admin-badge--${view.status}`}>
          {applicationPayLabel(view.status)}
        </span>
      ) : (
        <FieldSelect
          value={view.status}
          options={STATUS_OPTIONS}
          onChange={(v) => patch({ status: v as AdminPayStatus })}
        />
      ),
    },
    {
      label: "주소",
      value: locked ? (
        dash(view.address)
      ) : (
        <FieldInput value={view.address} onChange={(v) => patch({ address: v })} />
      ),
    },
    {
      label: "상세주소",
      value: locked ? (
        dash(view.addressDetail)
      ) : (
        <FieldInput value={view.addressDetail} onChange={(v) => patch({ addressDetail: v })} />
      ),
    },
  ];

  return (
    <>
      <div
        className="admin-drawer__dim"
        role="presentation"
        aria-hidden="true"
        onClick={requestClose}
      />
      <aside className="admin-drawer" role="dialog" aria-modal="true" aria-label="신청 상세">
        <div className="admin-drawer__head">
          <div className="admin-drawer__actions">
            {editing ? (
              <>
                <button type="button" className="admin-btn admin-btn--ghost" onClick={cancelEdit}>
                  취소
                </button>
                <button type="button" className="admin-btn admin-btn--primary" onClick={saveEdit}>
                  저장
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  onClick={async () => {
                    if (!(await confirm("이 신청을 삭제할까요?"))) return;
                    onDelete?.(row.id);
                    adminToast.success("신청이 삭제되었습니다.");
                    onClose();
                  }}
                >
                  삭제
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  onClick={async () => {
                    const next = await prompt({
                      title: "비밀번호 초기화",
                      label: "새 비밀번호",
                      type: "password",
                      minLength: 4,
                    });
                    if (next == null) return;
                    adminToast.success("비밀번호가 초기화되었습니다.");
                  }}
                >
                  비밀번호 초기화
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--primary"
                  onClick={startEdit}
                >
                  수정하기
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  onClick={requestClose}
                >
                  닫기
                </button>
              </>
            )}
          </div>
        </div>

        <dl className="admin-drawer__fields">
          {fields.map((field) => (
            <div key={field.label} className="admin-drawer__row">
              <dt>{field.label}</dt>
              <dd>{field.value}</dd>
            </div>
          ))}
        </dl>

        <div className="admin-drawer__foot">
          {editing ? (
            <>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={cancelEdit}>
                취소
              </button>
              <button type="button" className="admin-btn admin-btn--primary" onClick={saveEdit}>
                저장
              </button>
            </>
          ) : (
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={requestClose}
            >
              닫기
            </button>
          )}
        </div>
      </aside>
      {confirmModal}
      {promptModal}
    </>
  );
}
