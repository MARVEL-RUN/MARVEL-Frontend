"use client";

import { adminToast } from "@/components/admin/Toast";
import { AdminSelect } from "@/components/admin/Select";
import { AdminTableShell } from "@/components/admin/Table/AdminTableShell";
import {
  getAdminRaceEvent,
  VIRTUAL_ROUND_LABEL,
  type AdminRaceEventId,
  type VirtualRoundId,
} from "@/lib/admin/raceEvents";
import { EVENT } from "@/lib/event";
import { type CourseId } from "@/lib/register";
import {
  applicationCourseLabel,
  applicationGenderLabel,
  applicationKindLabel,
  applicationRoundLabel,
  listApplicationsByEvent,
  type AdminApplicationRow,
  type ApplicationKind,
} from "@/services/admin/applications";
import type { AdminPayStatus } from "@/types/admin";
import { useQuery } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { ApplicationDetailDrawer } from "./ApplicationDetailDrawer";
import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 10;

const STATUS_LABEL: Record<AdminPayStatus, string> = {
  paid: "결제완료",
  pending: "대기",
  refund_requested: "환불신청",
  refunded: "환불완료",
};

const KIND_OPTIONS: { value: ApplicationKind | ""; label: string }[] = [
  { value: "", label: "전체 유형" },
  { value: "individual", label: "개인" },
  { value: "group", label: "단체" },
];

const ROUND_OPTIONS: { value: VirtualRoundId | ""; label: string }[] = [
  { value: "", label: "전체 차수" },
  { value: "1", label: VIRTUAL_ROUND_LABEL["1"] },
  { value: "2", label: VIRTUAL_ROUND_LABEL["2"] },
  { value: "3", label: VIRTUAL_ROUND_LABEL["3"] },
];

const STATUS_OPTIONS: { value: AdminPayStatus | ""; label: string }[] = [
  { value: "", label: "전체 상태" },
  { value: "paid", label: "결제완료" },
  { value: "pending", label: "대기" },
  { value: "refund_requested", label: "환불신청" },
  { value: "refunded", label: "환불완료" },
];

const STATUS_EDIT_OPTIONS: { value: AdminPayStatus; label: string }[] = [
  { value: "paid", label: "결제완료" },
  { value: "pending", label: "대기" },
  { value: "refund_requested", label: "환불신청" },
  { value: "refunded", label: "환불완료" },
];

type Applied = {
  q: string;
  kind: ApplicationKind | "";
  round: VirtualRoundId | "";
  courseId: CourseId | "";
  status: AdminPayStatus | "";
};

const INITIAL: Applied = {
  q: "",
  kind: "",
  round: "",
  courseId: "",
  status: "",
};

const EMPTY_ROWS: AdminApplicationRow[] = [];

function StatusBadge({ status }: { status: AdminPayStatus }) {
  return <span className={`admin-badge admin-badge--${status}`}>{STATUS_LABEL[status]}</span>;
}

function CellInput({
  value,
  onChange,
  type = "text",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <input
      className={["admin-cell-input", className].filter(Boolean).join(" ")}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function CellSelect({
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
      className="admin-cell-input admin-cell-input--select"
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

type Props = {
  eventId: AdminRaceEventId;
};

export function ApplicationsListPage({ eventId }: Props) {
  const event = getAdminRaceEvent(eventId);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "applications", eventId],
    queryFn: () => listApplicationsByEvent(eventId),
  });

  const [rowsState, setRowsState] = useState<AdminApplicationRow[]>([]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<AdminApplicationRow[]>([]);

  const [q, setQ] = useState("");
  const [kind, setKind] = useState<ApplicationKind | "">("");
  const [round, setRound] = useState<VirtualRoundId | "">("");
  const [courseId, setCourseId] = useState<CourseId | "">("");
  const [status, setStatus] = useState<AdminPayStatus | "">("");
  const [applied, setApplied] = useState<Applied>(INITIAL);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setRowsState(data);
    setEditing(false);
    setDraft([]);
    setSelectedId(null);
  }, [data]);

  const courseOptions = useMemo(
    () => [
      { value: "" as const, label: "전체 코스" },
      ...EVENT.courses.map((course) => ({
        value: course.id as CourseId | "",
        label: course.distance,
      })),
    ],
    [],
  );

  const courseEditOptions = useMemo(
    () =>
      EVENT.courses.map((course) => ({
        value: course.id,
        label: course.distance,
      })),
    [],
  );

  const source = editing ? draft : rowsState.length ? rowsState : (data ?? EMPTY_ROWS);

  const filtered = useMemo(() => {
    const keyword = applied.q.trim().toLowerCase();
    return source.filter((row) => {
      if (applied.kind && row.kind !== applied.kind) return false;
      if (applied.round && row.round !== applied.round) return false;
      if (applied.courseId && row.courseId !== applied.courseId) return false;
      if (applied.status && row.status !== applied.status) return false;
      if (!keyword) return true;
      return [row.orderNo, row.name, row.leaderName, row.phone, row.souvenir]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [applied, source]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const runSearch = () => {
    setApplied({ q, kind, round, courseId, status });
    setPage(1);
  };

  const resetSearch = () => {
    setQ("");
    setKind("");
    setRound("");
    setCourseId("");
    setStatus("");
    setApplied(INITIAL);
    setPage(1);
  };

  const startEdit = () => {
    setDraft(rowsState.map((row) => ({ ...row })));
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft([]);
    setEditing(false);
  };

  const saveEdit = () => {
    setRowsState(draft.map((row) => ({ ...row })));
    setDraft([]);
    setEditing(false);
    adminToast.success("신청 정보가 저장되었습니다.");
  };

  const patchRow = (id: string, patch: Partial<AdminApplicationRow>) => {
    setDraft((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const selected = useMemo(
    () => (selectedId ? source.find((row) => row.id === selectedId) ?? null : null),
    [selectedId, source],
  );

  const removeSelected = (id: string) => {
    setRowsState((prev) => prev.filter((row) => row.id !== id));
    setDraft((prev) => prev.filter((row) => row.id !== id));
  };

  if (!event) {
    return (
      <div className="admin-page">
        <p className="admin-empty">존재하지 않는 대회입니다.</p>
        <Link href="/admin/applications" className="admin-btn admin-btn--ghost">
          대회 목록
        </Link>
      </div>
    );
  }

  const locked = !editing;

  const nameHeader = event.allowsGroup ? "이름/단체명" : "이름";

  const sharedStart = [
    { key: "no", header: "번호", render: (row: AdminApplicationRow) => row.no },
    ...(event.allowsGroup
      ? [
          {
            key: "kind",
            header: "유형",
            render: (row: AdminApplicationRow) => applicationKindLabel(row.kind),
          },
        ]
      : []),
    {
      key: "name",
      header: nameHeader,
      render: (row: AdminApplicationRow) =>
        locked ? (
          row.name
        ) : (
          <CellInput value={row.name} onChange={(v) => patchRow(row.id, { name: v })} />
        ),
    },
    {
      key: "birth",
      header: "생년월일",
      render: (row: AdminApplicationRow) =>
        locked ? (
          row.birth || "-"
        ) : (
          <CellInput
            value={row.birth ?? ""}
            onChange={(v) => patchRow(row.id, { birth: v })}
            className="admin-cell-input--wide"
          />
        ),
    },
    {
      key: "gender",
      header: "성별",
      render: (row: AdminApplicationRow) =>
        locked ? (
          applicationGenderLabel(row.gender)
        ) : (
          <CellSelect
            value={row.gender ?? "male"}
            options={[
              { value: "male", label: "남성" },
              { value: "female", label: "여성" },
            ]}
            onChange={(v) => patchRow(row.id, { gender: v as "male" | "female" })}
          />
        ),
    },
  ];

  const sharedEnd = [
    {
      key: "souvenir",
      header: "기념품",
      render: (row: AdminApplicationRow) =>
        locked ? (
          row.souvenir
        ) : (
          <CellInput value={row.souvenir} onChange={(v) => patchRow(row.id, { souvenir: v })} />
        ),
    },
    {
      key: "phone",
      header: "연락처",
      render: (row: AdminApplicationRow) =>
        locked ? (
          row.phone
        ) : (
          <CellInput value={row.phone} onChange={(v) => patchRow(row.id, { phone: v })} />
        ),
    },
    {
      key: "marketing",
      header: "마케팅동의",
      render: (row: AdminApplicationRow) =>
        locked ? (
          row.marketingConsent ? "Y" : "N"
        ) : (
          <CellSelect
            value={row.marketingConsent ? "Y" : "N"}
            options={[
              { value: "Y", label: "Y" },
              { value: "N", label: "N" },
            ]}
            onChange={(v) => patchRow(row.id, { marketingConsent: v === "Y" })}
          />
        ),
    },
    {
      key: "status",
      header: "상태",
      render: (row: AdminApplicationRow) =>
        locked ? (
          <StatusBadge status={row.status} />
        ) : (
          <CellSelect
            value={row.status}
            options={STATUS_EDIT_OPTIONS}
            onChange={(v) => patchRow(row.id, { status: v as AdminPayStatus })}
          />
        ),
    },
    {
      key: "appliedAt",
      header: "신청일시",
      render: (row: AdminApplicationRow) => row.appliedAt,
    },
  ];

  const columns =
    eventId === "virtual"
      ? [
          ...sharedStart,
          {
            key: "round",
            header: "차수",
            render: (row: AdminApplicationRow) =>
              locked ? (
                applicationRoundLabel(row)
              ) : (
                <CellSelect
                  value={row.round ?? "1"}
                  options={[
                    { value: "1", label: "1차" },
                    { value: "2", label: "2차" },
                    { value: "3", label: "3차" },
                  ]}
                  onChange={(v) => patchRow(row.id, { round: v as VirtualRoundId })}
                />
              ),
          },
          ...sharedEnd,
        ]
      : [
          ...sharedStart,
          {
            key: "course",
            header: "코스",
            render: (row: AdminApplicationRow) =>
              locked ? (
                applicationCourseLabel(row)
              ) : (
                <CellSelect
                  value={row.courseId ?? ""}
                  options={courseEditOptions}
                  onChange={(v) => patchRow(row.id, { courseId: v as CourseId })}
                />
              ),
          },
          ...sharedEnd,
        ];

  return (
    <div className="admin-page admin-apps-list">
      <AdminTableShell<AdminApplicationRow>
        title={event.name}
        rows={rows}
        loading={isLoading}
        empty="신청 내역이 없습니다."
        rowKey={(row) => row.id}
        page={page}
        pageCount={pageCount}
        totalCount={filtered.length}
        onPage={(n) => setPage(n)}
        pageUnit="신청"
        onRowClick={
          editing
            ? undefined
            : (row) => {
                setSelectedId(row.id);
              }
        }
        actions={
          <div className="admin-table-shell__actions">
            <Link href="/admin/applications" className="admin-btn admin-btn--ghost">
              대회 목록
            </Link>
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
              <button type="button" className="admin-btn admin-btn--primary" onClick={startEdit}>
                수정하기
              </button>
            )}
          </div>
        }
        tools={
          <>
            {event.allowsGroup ? (
              <AdminSelect
                value={kind}
                options={KIND_OPTIONS}
                onChange={setKind}
                ariaLabel="신청 유형"
                width={112}
              />
            ) : null}
            {event.hasRounds ? (
              <AdminSelect
                value={round}
                options={ROUND_OPTIONS}
                onChange={setRound}
                ariaLabel="차수"
                width={112}
              />
            ) : (
              <AdminSelect
                value={courseId}
                options={courseOptions}
                onChange={setCourseId}
                ariaLabel="코스"
                width={112}
              />
            )}
            <AdminSelect
              value={status}
              options={STATUS_OPTIONS}
              onChange={setStatus}
              ariaLabel="상태"
              width={112}
            />
            <input
              className="admin-toolbar__search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runSearch();
              }}
              placeholder={
                event.allowsGroup
                  ? "이름 · 단체명 · 주문번호 · 연락처"
                  : "이름 · 주문번호 · 연락처"
              }
            />
            <button
              type="button"
              className="admin-btn admin-btn--primary admin-toolbar__btn"
              onClick={runSearch}
            >
              검색
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-toolbar__iconbtn"
              aria-label="검색 초기화"
              title="초기화"
              onClick={resetSearch}
            >
              <RotateCcw size={24} strokeWidth={2.5} />
            </button>
          </>
        }
        columns={columns}
      />
      <ApplicationDetailDrawer
        row={selected}
        onClose={() => setSelectedId(null)}
        onDelete={removeSelected}
        onSave={(next) => {
          setRowsState((prev) => prev.map((r) => (r.id === next.id ? next : r)));
          setDraft((prev) => prev.map((r) => (r.id === next.id ? next : r)));
        }}
      />
    </div>
  );
}
