"use client";

import { DEFAULT_EVENT_ID } from "@/lib/main/config";
import { MainHttpError } from "@/lib/main/fetch";
import {
  EMPTY_START_GROUP_DRAFT,
  findStartGroup,
  sortedStartGroups,
  startGroupDescriptionParts,
  startGroupDraftError,
  startGroupDraftFromStored,
  startGroupInputFromDraft,
  startGroupInputFromStored,
  startGroupSelectionChanged,
  storedStartGroupMissingFromOptions,
  type StartGroupDraft,
} from "@/lib/start-group";
import { applicationPasswordError } from "@/lib/register";
import { categoryLabel, findCategory } from "@/lib/registration-options";
import {
  patchIndividualStartGroup,
  patchOrganizationStartGroups,
  organizationLookupParticipants,
} from "@/services/main/registrations";
import { fetchRegistrationOptions } from "@/services/main/registration-options";
import type {
  OrganizationLookupParticipant,
  RegistrationCategory,
  RegistrationReceipt,
  RegistrationStartGroup,
} from "@/services/main/types";
import { useEffect, useId, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { createPortal } from "react-dom";
import { PasswordField } from "../register/ApplyUi";

type BaseProps = {
  open: boolean;
  busy: boolean;
  error: string;
  onClose: () => void;
};

type IndividualProps = BaseProps & {
  kind: "individual";
  receipt: RegistrationReceipt;
  onConfirm: (password: string, draft: StartGroupDraft) => Promise<void>;
};

type GroupProps = BaseProps & {
  kind: "group";
  receipt: RegistrationReceipt;
  onConfirm: (
    password: string,
    items: { registrationId: string; draft: StartGroupDraft }[],
  ) => Promise<void>;
};

type Props = IndividualProps | GroupProps;

type GroupMemberRow = {
  registrationId: string;
  no: string;
  name: string;
  courseName: string;
  eventCategoryId: string;
  stored: ReturnType<typeof startGroupInputFromStored>;
  draft: StartGroupDraft;
};

export function LookupStartGroupModal(props: Props) {
  const { open, busy, error, onClose } = props;
  const titleId = useId();
  const errorId = useId();
  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [categories, setCategories] = useState<RegistrationCategory[]>([]);
  const [optionsError, setOptionsError] = useState("");
  const [individualDraft, setIndividualDraft] = useState<StartGroupDraft>(
    EMPTY_START_GROUP_DRAFT,
  );
  const [groupRows, setGroupRows] = useState<GroupMemberRow[]>([]);
  const [openRows, setOpenRows] = useState<Set<string>>(() => new Set());

  function toggleRow(id: string) {
    setOpenRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setPassword("");
      setLocalError("");
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, busy, onClose]);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    fetchRegistrationOptions(DEFAULT_EVENT_ID)
      .then((data) => {
        if (!alive) return;
        setCategories(data.categories ?? []);
        setOptionsError("");
      })
      .catch(() => {
        if (!alive) return;
        setCategories([]);
        setOptionsError("출발 그룹 선택지를 불러오지 못했습니다.");
      });
    return () => {
      alive = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (props.kind === "individual") {
      setIndividualDraft(
        startGroupDraftFromStored(
          props.receipt.startGroupId,
          props.receipt.startGroupUnselected,
        ),
      );
      return;
    }
    const rows = organizationLookupParticipants(props.receipt)
      .filter((row) => !row.canceled)
      .map((row, index) => participantRow(row, index))
      .filter((row) => row.registrationId?.trim());
    setGroupRows(rows);
    setOpenRows(new Set(rows[0] ? [rows[0].registrationId] : []));
  }, [open, props]);

  function participantRow(row: OrganizationLookupParticipant, index: number): GroupMemberRow {
    const stored = startGroupInputFromStored(row.startGroupId, row.startGroupUnselected);
    return {
      registrationId: row.registrationId,
      no: String(index + 1).padStart(2, "0"),
      name: row.name?.trim() || "참가자",
      courseName: row.eventCategoryName?.trim() || "",
      eventCategoryId: row.eventCategoryId || "",
      stored,
      draft: startGroupDraftFromStored(row.startGroupId, row.startGroupUnselected),
    };
  }

  async function onSubmit() {
    setLocalError("");
    const passwordErr = applicationPasswordError(password);
    if (passwordErr) {
      setLocalError(passwordErr);
      return;
    }
    if (optionsError) {
      setLocalError(optionsError);
      return;
    }

    try {
      if (props.kind === "individual") {
        const category = findCategory(categories, props.receipt.eventCategoryId || "");
        const pickErr = startGroupDraftError(individualDraft, category);
        if (pickErr) {
          setLocalError(pickErr);
          return;
        }
        await props.onConfirm(password.trim(), individualDraft);
        return;
      }

      const changed = groupRows.filter((row) =>
        startGroupSelectionChanged(row.stored, row.draft),
      );
      if (!changed.length) {
        setLocalError("변경할 출발 그룹을 선택하세요.");
        return;
      }
      for (const row of changed) {
        const category = findCategory(categories, row.eventCategoryId);
        const pickErr = startGroupDraftError(row.draft, category);
        if (pickErr) {
          setOpenRows((prev) => new Set(prev).add(row.registrationId));
          setLocalError(`${row.no} ${row.name}: ${pickErr}`);
          return;
        }
      }
      await props.onConfirm(
        password.trim(),
        changed.map((row) => ({
          registrationId: row.registrationId,
          draft: row.draft,
        })),
      );
    } catch (err) {
      setLocalError(
        err instanceof MainHttpError
          ? err.message
          : err instanceof Error
            ? err.message
            : "출발 그룹을 저장하지 못했습니다.",
      );
    }
  }

  if (!open || !mounted) return null;

  const showError = localError || error;
  const changedCount =
    props.kind === "group"
      ? groupRows.filter((row) => startGroupSelectionChanged(row.stored, row.draft)).length
      : 0;
  const individualCategory =
    props.kind === "individual"
      ? findCategory(categories, props.receipt.eventCategoryId || "")
      : undefined;

  return createPortal(
    <div className="inquiry-secret lookup-start-group" role="presentation">
      <button
        type="button"
        className="inquiry-secret__dim"
        onClick={() => {
          if (!busy) onClose();
        }}
        aria-label="닫기"
      />
      <div
        className="inquiry-secret__panel lookup-start-group__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={showError ? errorId : undefined}
      >
        <header className="inquiry-secret__head">
          <div className="lookup-start-group__title">
            <span className="kicker">START GROUP</span>
            <h2 id={titleId}>
              출발 그룹 <em>설정</em>
            </h2>
          </div>
          <button
            type="button"
            className="inquiry-secret__x"
            onClick={onClose}
            disabled={busy}
            aria-label="닫기"
          >
            <X size={20} strokeWidth={2.25} />
          </button>
        </header>
        <p className="inquiry-secret__desc">
          {props.kind === "individual"
            ? "예상 완주 기록에 맞는 출발 그룹을 선택하세요."
            : "참가자별 출발 그룹을 선택하세요. 바꾼 참가자만 저장됩니다."}
        </p>
        <div className="lookup-start-group__body">
          {optionsError ? (
            <p className="form-row__hint" role="status">
              {optionsError}
            </p>
          ) : null}
          {props.kind === "individual" ? (
            <div className="lookup-start-group__solo">
              {storedStartGroupMissingFromOptions(
                props.receipt.startGroupId,
                individualCategory,
              ) ? (
                <p className="form-row__hint" role="status">
                  현재 배정 그룹이 선택지에 없습니다. 다시 선택해 주세요.
                </p>
              ) : null}
              <StartGroupChoice
                groups={sortedStartGroups(individualCategory)}
                value={individualDraft}
                onChange={setIndividualDraft}
                disabled={busy || Boolean(optionsError)}
                name="lookup-personal-start-group"
              />
            </div>
          ) : (
            <ul className="lookup-start-group__members">
              {groupRows.map((row) => {
                const category = findCategory(categories, row.eventCategoryId);
                const course = row.courseName || (category ? categoryLabel(category) : "");
                const changed = startGroupSelectionChanged(row.stored, row.draft);
                const expanded = openRows.has(row.registrationId);
                const choiceId = `lookup-sg-${row.registrationId}`;
                const pickedCode = findStartGroup(category, row.draft.startGroupId)?.code;
                const picked = row.draft.startGroupUnselected
                  ? "미정"
                  : pickedCode
                    ? `${pickedCode}그룹`
                    : "미선택";
                return (
                  <li
                    key={row.registrationId}
                    className={[changed ? "is-changed" : "", expanded ? "is-open" : ""]
                      .filter(Boolean)
                      .join(" ") || undefined}
                  >
                    <button
                      type="button"
                      className="lookup-start-group__member-head"
                      aria-expanded={expanded}
                      aria-controls={choiceId}
                      onClick={() => toggleRow(row.registrationId)}
                    >
                      <span className="lookup-start-group__member-no">{row.no}</span>
                      <strong className="lookup-start-group__member-name">{row.name}</strong>
                      {course ? (
                        <span className="lookup-start-group__member-course">{course}</span>
                      ) : null}
                      <span className="lookup-start-group__member-side">
                        {changed ? (
                          <span className="lookup-start-group__member-flag">변경</span>
                        ) : null}
                        <span className="lookup-start-group__member-picked">{picked}</span>
                        <ChevronDown
                          className="lookup-start-group__member-caret"
                          size={18}
                          strokeWidth={2.25}
                          aria-hidden
                        />
                      </span>
                    </button>
                    {storedStartGroupMissingFromOptions(
                      row.stored.startGroupId,
                      category,
                    ) ? (
                      <p className="form-row__hint" role="status">
                        현재 배정 그룹이 선택지에 없습니다.
                      </p>
                    ) : null}
                    <div id={choiceId} hidden={!expanded}>
                      <StartGroupChoice
                        groups={sortedStartGroups(category)}
                        value={row.draft}
                        disabled={busy || Boolean(optionsError) || !row.eventCategoryId}
                        name={`lookup-org-${row.registrationId}`}
                        label={`${row.no} ${row.name} 출발 그룹`}
                        onChange={(next) =>
                          setGroupRows((rows) =>
                            rows.map((item) =>
                              item.registrationId === row.registrationId
                                ? { ...item, draft: next }
                                : item,
                            ),
                          )
                        }
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="lookup-start-group__foot">
          <div className="field">
            <span>{props.kind === "individual" ? "신청 비밀번호" : "단체 비밀번호"}</span>
            <PasswordField
              value={password}
              onChange={setPassword}
              placeholder="비밀번호 확인"
              autoComplete="current-password"
              disabled={busy}
            />
          </div>
          {showError ? (
            <p id={errorId} className="inquiry-secret__error" role="alert">
              {showError}
            </p>
          ) : null}
          <div className="inquiry-secret__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>
              취소
            </button>
            <button
              type="button"
              className="btn btn--red"
              onClick={() => void onSubmit()}
              disabled={busy}
            >
              {busy ? "저장 중..." : changedCount ? `${changedCount}명 저장` : "저장"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

const UNSELECTED_KEY = "__unselected";

function StartGroupChoice({
  groups,
  value,
  onChange,
  disabled,
  name,
  label = "출발 그룹",
}: {
  groups: RegistrationStartGroup[];
  value: StartGroupDraft;
  onChange: (next: StartGroupDraft) => void;
  disabled?: boolean;
  name: string;
  label?: string;
}) {
  if (!groups.length) {
    return <p className="start-group-pick--empty">출발 그룹 선택지를 불러오지 못했습니다.</p>;
  }
  const current = value.startGroupUnselected ? UNSELECTED_KEY : value.startGroupId;
  const options = [
    ...groups.map((group) => {
      const { finish, pace } = startGroupDescriptionParts(group.description);
      return { key: group.id, code: group.code, title: finish, sub: pace };
    }),
    { key: UNSELECTED_KEY, code: "미정", title: "잘 모르겠어요", sub: "후미 출발 그룹으로 배정" },
  ];

  return (
    <div className="lookup-start-group__choice" role="radiogroup" aria-label={label}>
      {options.map((option) => {
        const checked = current === option.key;
        return (
          <label
            key={option.key}
            className={`lookup-start-group__opt${checked ? " is-on" : ""}${
              disabled ? " is-disabled" : ""
            }`}
          >
            <input
              type="radio"
              name={name}
              checked={checked}
              disabled={disabled}
              onChange={() =>
                onChange(
                  option.key === UNSELECTED_KEY
                    ? { startGroupId: "", startGroupUnselected: true }
                    : { startGroupId: option.key, startGroupUnselected: false },
                )
              }
            />
            <span className="lookup-start-group__opt-code">{option.code}</span>
            {option.title ? (
              <span className="lookup-start-group__opt-title">{option.title}</span>
            ) : null}
            {option.sub ? <span className="lookup-start-group__opt-sub">{option.sub}</span> : null}
          </label>
        );
      })}
    </div>
  );
}

export async function saveIndividualLookupStartGroup(
  receipt: RegistrationReceipt,
  password: string,
  draft: StartGroupDraft,
) {
  const registrationId = receipt.registrationId?.trim();
  if (!registrationId) throw new Error("신청 정보를 찾을 수 없습니다.");
  await patchIndividualStartGroup(DEFAULT_EVENT_ID, registrationId, {
    password,
    ...startGroupInputFromDraft(draft),
  });
}

export async function saveOrganizationLookupStartGroups(
  organizationId: string,
  password: string,
  items: { registrationId: string; draft: StartGroupDraft }[],
) {
  if (!items.length) throw new Error("변경할 참가자를 선택하세요.");
  await patchOrganizationStartGroups(DEFAULT_EVENT_ID, organizationId, {
    password,
    registrations: items.map((item) => ({
      registrationId: item.registrationId,
      ...startGroupInputFromDraft(item.draft),
    })),
  });
}
