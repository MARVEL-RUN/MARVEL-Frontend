"use client";

import { useAdminConfirm } from "@/components/admin/ConfirmModal";
import { adminToast } from "@/components/admin/Toast";
import { saveAdminFile } from "@/lib/admin/download";
import { isAdminHttp } from "@/lib/admin/fetch";
import {
  downloadVirtualPackingList,
  downloadVirtualPrintList,
  fetchVirtualRounds,
  issueVirtualBibs,
  replaceVirtualRounds,
  type BibIssueResult,
  type VirtualRound,
} from "@/services/admin/virtual-rounds";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type RoundDraft = {
  key: string;
  startAt: string;
  deadline: string;
  originalStartAt: string | null;
  originalDeadline: string | null;
};

type Phase = "closed" | "open" | "upcoming";

function errorText(error: unknown) {
  if (isAdminHttp(error)) return error.message;
  return error instanceof Error ? error.message : "처리하지 못했습니다.";
}

function clockValue(value: string) {
  const match = value.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})(?::(\d{2}))?/);
  if (!match) return "";
  return match[2] ? `${match[1]}:${match[2]}` : match[1];
}

function toKstDateTime(value: string) {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) return `${trimmed}:00`;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  return "";
}

function sameClock(original: string, edited: string) {
  const saved = clockValue(original);
  const next = edited.trim();
  return saved === next || saved === `${next}:00` || `${saved}:00` === next;
}

function phaseOf(startAt: string, deadline: string, now: number): Phase {
  const start = Date.parse(startAt);
  const deadlineMs = Date.parse(deadline);
  if (!Number.isFinite(start) || !Number.isFinite(deadlineMs)) return "upcoming";
  if (now >= deadlineMs) return "closed";
  if (now >= start) return "open";
  return "upcoming";
}

function phaseLabel(phase: Phase) {
  if (phase === "closed") return "마감";
  if (phase === "open") return "진행";
  return "예정";
}

function toDraft(round: VirtualRound, index: number): RoundDraft {
  return {
    key: `saved-${index}-${round.deadline}`,
    startAt: clockValue(round.startAt),
    deadline: clockValue(round.deadline),
    originalStartAt: round.startAt,
    originalDeadline: round.deadline,
  };
}

function savedPhase(draft: RoundDraft, now: number): Phase {
  if (!draft.originalStartAt || !draft.originalDeadline) return "upcoming";
  return phaseOf(draft.originalStartAt, draft.originalDeadline, now);
}

function rowDirty(draft: RoundDraft) {
  if (!draft.originalStartAt || !draft.originalDeadline) return true;
  return (
    !sameClock(draft.originalStartAt, draft.startAt) ||
    !sameClock(draft.originalDeadline, draft.deadline)
  );
}

/* 마감된 차수는 서버가 준 문자열 그대로 다시 보낸다 */
function outgoing(draft: RoundDraft, field: "start" | "deadline", locked: boolean) {
  const original = field === "start" ? draft.originalStartAt : draft.originalDeadline;
  const edited = field === "start" ? draft.startAt : draft.deadline;
  if (locked && original) return original;
  if (original && sameClock(original, edited)) return original;
  return toKstDateTime(edited);
}

function bibIssueText(result: BibIssueResult) {
  const parts = [
    `발급 ${result.issuedCount}건`,
    `이미 발급 ${result.alreadyIssuedCount}건`,
    `외부 결제 ${result.externalPaymentSkippedCount}건`,
  ];
  if (result.registrationsWithoutEntriesCount > 0) {
    parts.push(`참가자 없음 ${result.registrationsWithoutEntriesCount}건`);
  }
  return parts.join(" · ");
}

export function VirtualRoundsPanel({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient();
  const { confirm, modal } = useAdminConfirm();
  const [drafts, setDrafts] = useState<RoundDraft[]>([]);
  const [loadedKey, setLoadedKey] = useState("");
  const [busy, setBusy] = useState("");
  const query = useQuery({
    queryKey: ["admin", "virtual-rounds", eventId],
    queryFn: () => fetchVirtualRounds(eventId),
    enabled: Boolean(eventId),
  });

  useEffect(() => {
    if (!query.data) return;
    const key = JSON.stringify(query.data);
    if (key === loadedKey) return;
    setLoadedKey(key);
    setDrafts(query.data.map(toDraft));
  }, [loadedKey, query.data]);

  const now = Date.now();
  const dirty =
    query.data != null &&
    (drafts.length !== query.data.length || drafts.some(rowDirty));

  const updateDraft = (key: string, patch: Partial<RoundDraft>) => {
    setDrafts((prev) => prev.map((draft) => (draft.key === key ? { ...draft, ...patch } : draft)));
  };

  const addRound = () => {
    setDrafts((prev) => [
      ...prev,
      {
        key: `new-${Date.now()}`,
        startAt: "",
        deadline: "",
        originalStartAt: null,
        originalDeadline: null,
      },
    ]);
  };

  const removeRound = (key: string) => {
    setDrafts((prev) => prev.filter((draft) => draft.key !== key));
  };

  const save = async () => {
    if (!eventId || busy) return;
    const rounds: VirtualRound[] = [];
    for (const [index, draft] of drafts.entries()) {
      const phase = savedPhase(draft, Date.now());
      const startAt = outgoing(draft, "start", phase === "closed" || phase === "open");
      const deadline = outgoing(draft, "deadline", phase === "closed");
      if (!startAt || !deadline) {
        adminToast.error(`${index + 1}회차 시작과 마감을 입력하세요.`);
        return;
      }
      const startMs = Date.parse(startAt);
      const deadlineMs = Date.parse(deadline);
      if (!Number.isFinite(startMs) || !Number.isFinite(deadlineMs) || startMs >= deadlineMs) {
        adminToast.error(`${index + 1}회차 마감은 시작보다 뒤여야 합니다.`);
        return;
      }
      const prev = rounds[index - 1];
      if (prev && Date.parse(prev.deadline) > startMs) {
        adminToast.error(`${index + 1}회차 시작은 이전 회차 마감 이후여야 합니다.`);
        return;
      }
      rounds.push({ startAt, deadline });
    }

    const ok = await confirm({
      title: "접수 회차 저장",
      message: "접수 회차 전체를 이 시각으로 바꿉니다. 마감된 회차는 그대로입니다.",
      confirmLabel: "저장",
    });
    if (!ok) return;

    setBusy("save");
    try {
      const saved = await replaceVirtualRounds(eventId, rounds);
      setLoadedKey(JSON.stringify(saved));
      setDrafts(saved.map(toDraft));
      void queryClient.invalidateQueries({ queryKey: ["admin", "virtual-rounds", eventId] });
      adminToast.success("접수 회차를 저장했습니다.");
    } catch (error) {
      adminToast.error(errorText(error));
    } finally {
      setBusy("");
    }
  };

  const issue = async (draft: RoundDraft, index: number) => {
    if (!draft.originalDeadline || busy) return;
    const ok = await confirm({
      title: `${index + 1}회차 배번 발급`,
      message: "마감된 접수 회차의 확정 참가자에게 배번을 발급합니다. 이미 있는 배번과 외부 결제는 건너뜁니다.",
      confirmLabel: "배번 발급",
    });
    if (!ok) return;
    setBusy(`issue-${draft.key}`);
    try {
      const result = await issueVirtualBibs(eventId, draft.originalDeadline);
      void queryClient.invalidateQueries({ queryKey: ["admin", "registrations", eventId] });
      adminToast.success(bibIssueText(result));
    } catch (error) {
      adminToast.error(errorText(error));
    } finally {
      setBusy("");
    }
  };

  const download = async (draft: RoundDraft, index: number, kind: "print" | "pack") => {
    if (!draft.originalDeadline || busy) return;
    const label = kind === "print" ? "인쇄명단" : "패킹명단";
    setBusy(`${kind}-${draft.key}`);
    try {
      const file =
        kind === "print"
          ? await downloadVirtualPrintList(eventId, draft.originalDeadline, `${label}_${index + 1}회차.xlsx`)
          : await downloadVirtualPackingList(
              eventId,
              draft.originalDeadline,
              `${label}_${index + 1}회차.xlsx`,
            );
      saveAdminFile(file.blob, file.filename || `${label}_${index + 1}회차.xlsx`);
      adminToast.success("엑셀 파일을 내려받았습니다.");
    } catch (error) {
      adminToast.error(errorText(error));
    } finally {
      setBusy("");
    }
  };

  return (
    <section className="admin-vr-rounds">
      <div className="admin-vr-rounds__head">
        <h2>접수 회차</h2>
        <p>마감된 회차는 바꿀 수 없고, 진행 중인 회차는 마감만 바꿀 수 있습니다.</p>
      </div>
      {query.isLoading ? <p className="admin-vr-rounds__status">접수 회차를 불러오는 중…</p> : null}
      {query.isError ? <p className="admin-vr-rounds__status">{errorText(query.error)}</p> : null}
      {query.isSuccess
        ? drafts.map((draft, index) => {
            const phase = savedPhase(draft, now);
            const dirty = rowDirty(draft);
            const startLocked = phase === "closed" || phase === "open";
            const deadlineLocked = phase === "closed";
            const canUseSaved = Boolean(draft.originalDeadline) && !dirty;
            const issueDisabled = !canUseSaved || phase !== "closed" || Boolean(busy);
            const issueTitle = !canUseSaved
              ? "저장한 뒤 발급할 수 있습니다."
              : "마감 뒤에 발급할 수 있습니다.";
            return (
              <div className="admin-vr-rounds__row" key={draft.key}>
                <span className="admin-vr-rounds__name">{index + 1}회차</span>
                <span className="admin-vr-rounds__phase">{phaseLabel(phase)}</span>
                <label className="admin-vr-rounds__field">
                  시작
                  <input
                    type="datetime-local"
                    step={1}
                    value={draft.startAt}
                    disabled={startLocked || Boolean(busy)}
                    aria-label={`${index + 1}회차 시작`}
                    onChange={(event) => updateDraft(draft.key, { startAt: event.target.value })}
                  />
                </label>
                <label className="admin-vr-rounds__field">
                  마감
                  <input
                    type="datetime-local"
                    step={1}
                    value={draft.deadline}
                    disabled={deadlineLocked || Boolean(busy)}
                    aria-label={`${index + 1}회차 마감`}
                    onChange={(event) => updateDraft(draft.key, { deadline: event.target.value })}
                  />
                </label>
                <div className="admin-vr-rounds__actions">
                  <span className="admin-vr-rounds__tip">
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost"
                      disabled={issueDisabled}
                      onClick={() => void issue(draft, index)}
                    >
                      {busy === `issue-${draft.key}` ? "발급 중…" : "배번 발급"}
                    </button>
                    {issueDisabled ? (
                      <>
                        <span className="admin-vr-rounds__tip-hit" />
                        <span className="admin-vr-rounds__tip-bubble" role="tooltip">
                          {issueTitle}
                        </span>
                      </>
                    ) : null}
                  </span>
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost"
                    disabled={!canUseSaved || Boolean(busy)}
                    title="저장한 마감 시각 기준입니다."
                    onClick={() => void download(draft, index, "print")}
                  >
                    {busy === `print-${draft.key}` ? "받는 중…" : "인쇄 명단"}
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost"
                    disabled={!canUseSaved || Boolean(busy)}
                    title="저장한 마감 시각 기준입니다."
                    onClick={() => void download(draft, index, "pack")}
                  >
                    {busy === `pack-${draft.key}` ? "받는 중…" : "패킹 명단"}
                  </button>
                  {phase === "upcoming" ? (
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost admin-btn--danger-text"
                      disabled={Boolean(busy)}
                      onClick={() => removeRound(draft.key)}
                    >
                      삭제
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })
        : null}
      {query.isSuccess && drafts.length === 0 ? (
        <p className="admin-vr-rounds__status">등록된 접수 회차가 없습니다.</p>
      ) : null}
      {query.isSuccess ? (
        <div className="admin-vr-rounds__foot">
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            disabled={Boolean(busy)}
            onClick={addRound}
          >
            회차 추가
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            disabled={!dirty || Boolean(busy)}
            onClick={() => void save()}
          >
            {busy === "save" ? "저장 중…" : "저장"}
          </button>
        </div>
      ) : null}
      {modal}
    </section>
  );
}
