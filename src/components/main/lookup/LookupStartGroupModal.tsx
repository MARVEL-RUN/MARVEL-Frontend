"use client";

import { DEFAULT_EVENT_ID } from "@/lib/main/config";
import { MainHttpError } from "@/lib/main/fetch";
import {
  EMPTY_START_GROUP_DRAFT,
  sortedStartGroups,
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
} from "@/services/main/types";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { PasswordField } from "../register/ApplyUi";
import { StartGroupPick } from "../register/StartGroupPick";

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
      >
        <header className="inquiry-secret__head">
          <h2 id={titleId}>출발 그룹 변경</h2>
          <p className="inquiry-secret__desc">
            {props.kind === "individual"
              ? "신청 비밀번호로 출발 그룹만 변경합니다."
              : "단체 비밀번호로 선택한 참가자의 출발 그룹만 변경합니다."}
          </p>
        </header>
        <div className="lookup-start-group__body">
          {props.kind === "individual" ? (
            <>
              {storedStartGroupMissingFromOptions(
                props.receipt.startGroupId,
                findCategory(categories, props.receipt.eventCategoryId || ""),
              ) ? (
                <p className="form__note" role="status">
                  현재 배정 그룹이 선택지에 없습니다. 다시 선택하거나 미선택으로 변경해 주세요.
                </p>
              ) : null}
              <StartGroupPick
                groups={sortedStartGroups(
                  findCategory(categories, props.receipt.eventCategoryId || ""),
                )}
                value={individualDraft}
                onChange={setIndividualDraft}
                disabled={busy || Boolean(optionsError)}
                namePrefix="lookup-personal"
              />
            </>
          ) : (
            <ul className="lookup-start-group__members">
              {groupRows.map((row) => {
                const category = findCategory(categories, row.eventCategoryId);
                const course = row.courseName || (category ? categoryLabel(category) : "");
                return (
                  <li key={row.registrationId}>
                    <p className="lookup-start-group__member-name">
                      {row.no} {row.name}
                      {course ? (
                        <span className="lookup-start-group__member-course">{course}</span>
                      ) : null}
                    </p>
                    {storedStartGroupMissingFromOptions(
                      row.stored.startGroupId,
                      category,
                    ) ? (
                      <p className="form-row__hint" role="status">
                        현재 배정 그룹이 선택지에 없습니다.
                      </p>
                    ) : null}
                    <StartGroupPick
                      groups={sortedStartGroups(category)}
                      value={row.draft}
                      disabled={busy || Boolean(optionsError) || !row.eventCategoryId}
                      namePrefix={`lookup-org-${row.registrationId}`}
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
                  </li>
                );
              })}
            </ul>
          )}
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
            {busy ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
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
