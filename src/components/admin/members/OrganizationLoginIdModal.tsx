"use client";

import {
  filterOrgAccountInput,
  orgAccountError,
} from "@/lib/register";
import { checkAdminOrganizationDuplicateId } from "@/services/admin/organizations";
import { useEffect, useId, useState } from "react";

type DupStatus = "idle" | "checking" | "ok" | "taken" | "error";

type Props = {
  open: boolean;
  eventId: string;
  currentLoginId?: string;
  onCancel: () => void;
  onConfirm: (loginId: string) => void;
};

export function OrganizationLoginIdModal({
  open,
  eventId,
  currentLoginId = "",
  onCancel,
  onConfirm,
}: Props) {
  const titleId = useId();
  const inputId = useId();
  const hintId = useId();
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  const [dupStatus, setDupStatus] = useState<DupStatus>("idle");
  const [dupMessage, setDupMessage] = useState("");
  const [checkedValue, setCheckedValue] = useState("");

  useEffect(() => {
    if (!open) return;
    setValue("");
    setTouched(false);
    setDupStatus("idle");
    setDupMessage("");
    setCheckedValue("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const trimmed = value.trim();
  const formatErr = trimmed ? orgAccountError(trimmed) : "";
  const sameAsCurrent = Boolean(currentLoginId && trimmed === currentLoginId);
  const checkedOk = dupStatus === "ok" && checkedValue === trimmed;
  const canSubmit = Boolean(trimmed) && !formatErr && !sameAsCurrent && checkedOk;
  const showFormatError = touched && Boolean(trimmed) && Boolean(formatErr);

  let hintText = "5~20자, 영문·숫자·특수문자";
  let hintTone: "" | "is-error" | "is-ok" = "";

  if (showFormatError) {
    hintText = formatErr;
    hintTone = "is-error";
  } else if (sameAsCurrent) {
    hintText = "현재 아이디와 같습니다. 교체할 아이디를 입력해 주세요.";
    hintTone = "is-error";
  } else if (dupStatus === "checking") {
    hintText = "중복 확인 중…";
  } else if (dupStatus === "ok" && checkedValue === trimmed) {
    hintText = "사용 가능한 아이디입니다.";
    hintTone = "is-ok";
  } else if (dupStatus === "taken" && checkedValue === trimmed) {
    hintText = dupMessage || "이미 사용 중인 아이디입니다.";
    hintTone = "is-error";
  } else if (dupStatus === "error" && checkedValue === trimmed) {
    hintText = dupMessage || "아이디 중복 확인에 실패했습니다.";
    hintTone = "is-error";
  } else if (trimmed && !checkedOk) {
    hintText = "중복검사를 진행해 주세요.";
  }

  const runDupCheck = async () => {
    setTouched(true);
    if (!trimmed) return;
    if (formatErr) return;
    if (sameAsCurrent) return;

    setDupStatus("checking");
    setDupMessage("");
    setCheckedValue(trimmed);
    try {
      const result = await checkAdminOrganizationDuplicateId({
        eventId,
        groupLoginId: trimmed,
      });
      if (result.useableLoginId) {
        setDupStatus("ok");
        setDupMessage("");
        return;
      }
      setDupStatus("taken");
      setDupMessage("이미 사용 중인 아이디입니다.");
    } catch (err) {
      setDupStatus("error");
      setDupMessage(
        err instanceof Error ? err.message : "아이디 중복 확인에 실패했습니다.",
      );
    }
  };

  const submit = () => {
    setTouched(true);
    if (!canSubmit) return;
    onConfirm(trimmed);
  };

  return (
    <div className="admin-overlay" onClick={onCancel}>
      <div
        className="admin-overlay__box admin-input-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-input-modal__head">
          <h2 id={titleId}>아이디 변경</h2>
          <button
            type="button"
            className="admin-input-modal__close"
            aria-label="닫기"
            onClick={onCancel}
          >
            ×
          </button>
        </div>
        <p className="admin-input-modal__desc">
          교체할 단체 로그인 아이디를 입력한 뒤 중복검사를 진행해 주세요.
          (5~20자, 영문·숫자·특수문자)
        </p>
        <div className="admin-input-modal__body">
          <label className="admin-input-modal__field" htmlFor={inputId}>
            로그인 아이디
            <span
              className={`admin-input-modal__row${
                showFormatError || hintTone === "is-error" ? " is-error" : ""
              }`}
            >
              <input
                id={inputId}
                type="text"
                value={value}
                placeholder={
                  currentLoginId ? `현재: ${currentLoginId}` : "새 로그인 아이디"
                }
                autoFocus
                autoComplete="off"
                spellCheck={false}
                lang="en"
                aria-invalid={hintTone === "is-error"}
                aria-describedby={hintId}
                onChange={(e) => {
                  setValue(filterOrgAccountInput(e.target.value));
                  setDupStatus("idle");
                  setDupMessage("");
                  setCheckedValue("");
                }}
                onBlur={() => setTouched(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (checkedOk) submit();
                    else void runDupCheck();
                  }
                }}
              />
              <button
                type="button"
                className="admin-btn admin-btn--ghost admin-input-modal__check"
                disabled={dupStatus === "checking" || !trimmed}
                onClick={() => void runDupCheck()}
              >
                {dupStatus === "checking" ? "확인 중…" : "중복검사"}
              </button>
            </span>
          </label>
          <p
            id={hintId}
            className={`admin-input-modal__hint${hintTone ? ` ${hintTone}` : ""}`}
          >
            {hintText}
          </p>
        </div>
        <div className="admin-confirm__actions">
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            onClick={onCancel}
          >
            취소
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={submit}
            disabled={!canSubmit}
          >
            변경
          </button>
        </div>
      </div>
    </div>
  );
}
