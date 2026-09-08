"use client";

import { EVENT } from "@/lib/event";
import { courseById, type CourseId } from "@/lib/register";
import {
  listGroupApplications,
  type AdminGroupRow,
} from "@/services/admin/applications";
import { AdminTableShell } from "@/components/admin/Table/AdminTableShell";
import type { AdminPayStatus } from "@/types/admin";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

const PAGE_SIZE = 10;

const STATUS_LABEL: Record<AdminPayStatus, string> = {
  paid: "결제완료",
  pending: "대기",
  cancelled: "취소",
};

export function GroupApplicationsPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "applications", "group"],
    queryFn: listGroupApplications,
  });
  const [q, setQ] = useState("");
  const [courseId, setCourseId] = useState<CourseId | "">("");
  const [status, setStatus] = useState<AdminPayStatus | "">("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    return data.filter((row) => {
      if (courseId && row.courseId !== courseId) return false;
      if (status && row.status !== status) return false;
      if (!keyword) return true;
      return [row.orderNo, row.groupName, row.leaderName, row.phone]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [courseId, data, q, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="admin-page">
      <AdminTableShell<AdminGroupRow>
        title="단체 신청"
        rows={rows}
        loading={isLoading}
        empty="단체 신청 내역이 없습니다."
        rowKey={(row) => row.orderNo}
        page={page}
        pageCount={pageCount}
        onPage={(n) => setPage(n)}
        tools={
          <>
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="단체명 · 대표자 · 주문번호"
            />
            <select
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value as CourseId | "");
                setPage(1);
              }}
            >
              <option value="">전체 코스</option>
              {EVENT.courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.distance}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as AdminPayStatus | "");
                setPage(1);
              }}
            >
              <option value="">전체 상태</option>
              <option value="paid">결제완료</option>
              <option value="pending">대기</option>
              <option value="cancelled">취소</option>
            </select>
          </>
        }
        columns={[
          { key: "orderNo", header: "주문번호", render: (row) => row.orderNo },
          { key: "groupName", header: "단체명", render: (row) => row.groupName },
          { key: "leaderName", header: "대표자", render: (row) => row.leaderName },
          {
            key: "course",
            header: "대표 코스",
            render: (row) => courseById(row.courseId)?.distance ?? row.courseId,
          },
          { key: "count", header: "인원", render: (row) => `${row.participants.length}명` },
          { key: "phone", header: "연락처", render: (row) => row.phone },
          {
            key: "status",
            header: "상태",
            render: (row) => (
              <span className={`admin-badge admin-badge--${row.status}`}>
                {STATUS_LABEL[row.status]}
              </span>
            ),
          },
          { key: "appliedAt", header: "신청일시", render: (row) => row.appliedAt },
        ]}
      />
    </div>
  );
}
