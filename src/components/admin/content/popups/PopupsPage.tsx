"use client";

import { useAdminConfirm } from "@/components/admin/ConfirmModal";
import { adminToast } from "@/components/admin/Toast";
import { listPopups, savePopups } from "@/services/admin/popups";
import type { AdminPopup } from "@/types/popup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { PopupCard } from "./PopupCard";
import { PopupPreview } from "./PopupPreview";

function blankPopup(orderNo: number): AdminPopup {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T00:00`;
  return {
    id: `draft-${Date.now()}-${orderNo}`,
    url: "",
    startAt: stamp,
    endAt: `${now.getFullYear() + 1}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T23:59`,
    device: "BOTH",
    orderNo,
    imageUrl: "",
    visible: true,
    draft: true,
  };
}

export function PopupsPage() {
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "popups"],
    queryFn: listPopups,
  });
  const { confirm, modal } = useAdminConfirm();
  const [mode, setMode] = useState<"manage" | "preview">("manage");
  const [rows, setRows] = useState<AdminPopup[]>([]);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());

  useEffect(() => {
    setRows(data);
  }, [data]);

  const save = useMutation({
    mutationFn: () => savePopups(rows),
    onSuccess: (next) => {
      setRows(next);
      void queryClient.invalidateQueries({ queryKey: ["admin", "popups"] });
      adminToast.success("팝업이 저장되었습니다.");
      setMode("preview");
      setFlipped(new Set());
    },
    onError: () => adminToast.error("팝업 저장에 실패했습니다."),
  });

  const updateRow = (id: string, patch: Partial<AdminPopup>) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const move = (index: number, dir: -1 | 1) => {
    setRows((prev) => {
      const next = [...prev];
      const to = index + dir;
      if (to < 0 || to >= next.length) return prev;
      [next[index], next[to]] = [next[to], next[index]];
      return next;
    });
  };

  const addNew = () => {
    const row = blankPopup(rows.length + 1);
    setRows((prev) => [...prev, row]);
    setFlipped((prev) => new Set(prev).add(row.id));
    setMode("manage");
  };

  const addAfter = (index: number) => {
    const row = blankPopup(index + 2);
    setRows((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, row);
      return next;
    });
    setFlipped((prev) => new Set(prev).add(row.id));
  };

  const removeAt = async (index: number) => {
    const target = rows[index];
    if (!target) return;
    if (!(await confirm("이 팝업을 삭제할까요?"))) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
    setFlipped((prev) => {
      const next = new Set(prev);
      next.delete(target.id);
      return next;
    });
  };

  const toggleFlip = (id: string) => {
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="admin-page">
      <section className="admin-table-shell admin-popup-page">
        <div className="admin-table-shell__head">
          <h1>메인 팝업</h1>
        </div>

        <div className="admin-popup-toolbar">
          <div className="admin-popup-toolbar__tabs" role="tablist">
            <button
              type="button"
              className={mode === "manage" ? "is-on" : undefined}
              onClick={() => setMode("manage")}
            >
              관리
            </button>
            <button
              type="button"
              className={mode === "preview" ? "is-on" : undefined}
              onClick={() => setMode("preview")}
            >
              미리보기
            </button>
          </div>
          <div className="admin-popup-toolbar__actions">
            <button type="button" className="admin-btn admin-btn--ghost" onClick={addNew}>
              추가하기
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              onClick={() => save.mutate()}
              disabled={save.isPending || isLoading}
            >
              {save.isPending ? "저장 중..." : "저장하기"}
            </button>
          </div>
        </div>

        <div className="admin-popup-body">
          {isLoading ? (
            <p className="admin-empty">불러오는 중…</p>
          ) : mode === "preview" ? (
            <PopupPreview rows={rows} />
          ) : rows.length === 0 ? (
            <div className="admin-popup-empty">
              <p>등록된 팝업이 없습니다</p>
              <span>위의 “추가하기” 버튼을 클릭하여 팝업을 추가하세요.</span>
            </div>
          ) : (
            <>
              <div className="admin-popup-grid">
                {rows.map((row, index) => (
                  <PopupCard
                    key={row.id}
                    row={row}
                    index={index}
                    flipped={flipped.has(row.id)}
                    onFlip={() => toggleFlip(row.id)}
                    onChange={(patch) => updateRow(row.id, patch)}
                    onMove={(dir) => move(index, dir)}
                    onAddAfter={() => addAfter(index)}
                    onRemove={() => void removeAt(index)}
                  />
                ))}
              </div>
              <ul className="admin-popup-notes">
                <li>카드를 클릭하여 뒤집으면 상세 정보를 확인할 수 있습니다.</li>
                <li>▲ / ▼ 버튼으로 순서를 바꾼 뒤 상단 저장하기를 눌러야 반영됩니다.</li>
                <li>기간을 비우면 항상 노출로 간주됩니다.</li>
                <li>이미지는 JPG/PNG 권장, 20MB 이하.</li>
              </ul>
            </>
          )}
        </div>
      </section>
      {modal}
    </div>
  );
}
