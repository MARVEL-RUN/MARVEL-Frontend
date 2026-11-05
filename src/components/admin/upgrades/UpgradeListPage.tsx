"use client";

import { useAdminConfirm } from "@/components/admin/ConfirmModal";
import { AdminTableShell } from "@/components/admin/Table/AdminTableShell";
import { adminToast } from "@/components/admin/Toast";
import { isAdminHttp } from "@/lib/admin/fetch";
import { formatAdminBoardDate } from "@/lib/admin/formatDate";
import {
  cancelAdminUpgrade,
  cancelAdminUpgrades,
  fetchAdminUpgrades,
  type AdminUpgradeBulkResult,
  type AdminUpgradeRow,
} from "@/services/admin/upgrades";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

function won(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

function paymentLabel(status: string) {
  if (!status) return "-";
  if (status.toUpperCase() === "UNKNOWN") return "결제 결과 확인 중";
  return status;
}

function errorText(error: unknown) {
  if (isAdminHttp(error)) return error.message;
  return error instanceof Error ? error.message : "처리하지 못했습니다.";
}

export function UpgradeListPage({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient();
  const { confirm, modal } = useAdminConfirm();
  const [deadline, setDeadline] = useState("");
  const [bulk, setBulk] = useState<AdminUpgradeBulkResult | null>(null);
  const [bulkNote, setBulkNote] = useState("");
  const query = useQuery({
    queryKey: ["admin", "upgrades", eventId],
    queryFn: () => fetchAdminUpgrades(eventId),
    enabled: Boolean(eventId),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "upgrades", eventId] });
  };

  const cancelOne = useMutation({
    mutationFn: (upgradeId: string) => cancelAdminUpgrade(eventId, upgradeId),
    onSuccess: (result) => {
      adminToast.success(result.message || "상향을 취소했습니다.");
      refresh();
    },
    onError: (error) => adminToast.error(errorText(error)),
  });

  const cancelBulk = useMutation({
    mutationFn: async (value: string) => {
      const deadlineValue = value.length === 16 ? `${value}:00` : value;
      let afterUpgradeId: string | null = null;
      const seen = new Set<string>();
      const merged: AdminUpgradeBulkResult = {
        deadline: deadlineValue,
        processedCount: 0,
        canceledCount: 0,
        failedCount: 0,
        remainingCount: 0,
        blockedCount: 0,
        nextAfterUpgradeId: null,
        results: [],
      };
      do {
        if (afterUpgradeId) {
          if (seen.has(afterUpgradeId)) break;
          seen.add(afterUpgradeId);
        }
        const last = await cancelAdminUpgrades(eventId, { deadline: deadlineValue, afterUpgradeId });
        merged.processedCount += last.processedCount;
        merged.canceledCount += last.canceledCount;
        merged.failedCount += last.failedCount;
        merged.blockedCount += last.blockedCount;
        merged.remainingCount = last.remainingCount;
        merged.results.push(...last.results.filter((row) => !row.canceled && row.message));
        afterUpgradeId = last.nextAfterUpgradeId;
      } while (afterUpgradeId);
      return merged;
    },
    onSuccess: (result) => {
      setBulk(result);
      setBulkNote(
        `처리 ${result.processedCount}건 · 취소 ${result.canceledCount}건 · 실패 ${result.failedCount}건 · 결제 확인 중 ${result.blockedCount}건`,
      );
      refresh();
    },
    onError: (error) => adminToast.error(errorText(error)),
  });

  async function onCancel(row: AdminUpgradeRow) {
    const ok = await confirm({
      title: "상향 취소",
      message: `${row.name || "이 신청"}의 패키지 상향을 취소할까요?`,
      confirmLabel: "상향 취소",
    });
    if (!ok) return;
    cancelOne.mutate(row.upgradeId);
  }

  async function onBulk() {
    if (!deadline) {
      adminToast.error("차수 마감 시각을 입력하세요.");
      return;
    }
    const ok = await confirm({
      title: "상향 일괄 취소",
      message: "입력한 마감 시각 전에 만든 상향 대기를 취소합니다.",
      confirmLabel: "일괄 취소",
    });
    if (!ok) return;
    setBulk(null);
    setBulkNote("");
    cancelBulk.mutate(deadline);
  }

  return (
    <div className="admin-page">
      <AdminTableShell
        title="패키지 상향"
        rows={query.data ?? []}
        loading={query.isLoading}
        empty={query.isError ? errorText(query.error) : "상향 대기가 없습니다."}
        rowKey={(row) => row.upgradeId}
        tools={
          <div className="admin-toolbar__fields">
            <label className="admin-upgrade-deadline">
              차수 마감 시각
              <input
                type="datetime-local"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
              />
            </label>
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              disabled={cancelBulk.isPending}
              onClick={() => void onBulk()}
            >
              {cancelBulk.isPending ? "취소 중..." : "마감 건 일괄 취소"}
            </button>
          </div>
        }
        columns={[
          { key: "name", header: "신청자", render: (row) => row.name || "-" },
          {
            key: "current",
            header: "지금 종목",
            render: (row) => row.currentCategoryName || "-",
          },
          {
            key: "target",
            header: "대상 패키지",
            render: (row) => row.targetCategoryName || "-",
          },
          { key: "amount", header: "차액", render: (row) => won(row.amount) },
          {
            key: "applied",
            header: "신청일",
            render: (row) => formatAdminBoardDate(row.appliedAt),
          },
          {
            key: "requested",
            header: "요청 시각",
            render: (row) => formatAdminBoardDate(row.requestedAt),
          },
          {
            key: "pay",
            header: "결제",
            render: (row) => paymentLabel(row.lastPaymentStatus),
          },
          {
            key: "entries",
            header: "추가 참가자",
            render: (row) =>
              row.addedEntries.length
                ? row.addedEntries
                    .map((entry) =>
                      [entry.eventCategoryName, entry.name].filter(Boolean).join(" "),
                    )
                    .join(", ")
                : "-",
          },
          {
            key: "cancel",
            header: "",
            render: (row) => (
              <button
                type="button"
                className="admin-btn"
                disabled={cancelOne.isPending}
                onClick={() => void onCancel(row)}
              >
                취소
              </button>
            ),
          },
        ]}
      />
      {bulkNote ? <p className="admin-empty">{bulkNote}</p> : null}
      {bulk?.results.length ? (
        <ul className="admin-empty">
          {bulk.results.map((row) => (
            <li key={`${row.upgradeId}-${row.message}`}>
              {row.name || row.upgradeId} · {row.message}
            </li>
          ))}
        </ul>
      ) : null}
      {modal}
    </div>
  );
}
