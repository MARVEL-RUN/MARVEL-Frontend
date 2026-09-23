"use client";

import {
  categoryClosedReason,
  categoryLabel,
  categoryOpenForBirth,
  findCategory,
  findCategoryByLabel,
  shirtAssignment,
  shirtSouvenir,
  souvenirSizes,
  sortedSouvenirs,
} from "@/lib/registration-options";
import { ticketForBirth } from "@/lib/register";
import { RefundResultPanel } from "@/components/admin/applications/RefundResultPanel";
import { fetchAdminRegistrationOptions } from "@/services/admin/registration-options";
import {
  applyRegistrationDetail,
  fetchAdminRegistration,
  type AdminSelectedSouvenir,
} from "@/services/admin/applications";
import {
  mapOrganizationMemberToApplicationRow,
  type AdminOrganizationMember,
} from "@/services/admin/organizations";
import type {
  AdminPartialRefundTarget,
  AdminRefundBatchResponse,
} from "@/services/admin/refunds";
import type { RegistrationCategory } from "@/services/main/types";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";

const TARGET_LIMIT = 100;

type Props = {
  eventId: string;
  organizationId: string;
  members: AdminOrganizationMember[];
  pending?: boolean;
  result?: AdminRefundBatchResponse | null;
  onCancel: () => void;
  onSubmit: (targets: AdminPartialRefundTarget[]) => void;
};

type Draft = {
  registrationId: string;
  name: string;
  eventCategoryId: string;
  birth: string;
  souvenirs: AdminSelectedSouvenir[];
  baselineCategoryId: string;
  baselineBirth: string;
  baselineSouvenirs: AdminSelectedSouvenir[];
};

function birthDigits(raw: string) {
  return raw.replace(/\D/g, "").slice(0, 8);
}

function toApiBirth(raw: string) {
  const digits = birthDigits(raw);
  if (digits.length === 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  }
  return raw.trim();
}

function ticketFromBirthInput(raw: string) {
  const digits = birthDigits(raw);
  return digits.length === 8 ? ticketForBirth(digits) : "adult";
}

function selectionsForCategory(
  category: RegistrationCategory,
  previous: AdminSelectedSouvenir[],
  birth: string,
) {
  const digits = birthDigits(birth);
  const ticket = ticketFromBirthInput(digits);
  const shirt = shirtSouvenir(category);
  return sortedSouvenirs(category).map((souvenir) => {
    const prev = previous.find((item) => item.souvenirId === souvenir.souvenirId);
    if (shirt && souvenir.souvenirId === shirt.souvenirId) {
      const assigned = shirtAssignment(category, prev?.selectedSize ?? "", digits);
      return {
        souvenirId: souvenir.souvenirId,
        selectedSize: assigned.selectedSize || null,
      };
    }
    const sizes = souvenirSizes(souvenir, ticket);
    const keep =
      prev?.selectedSize && sizes.includes(prev.selectedSize) ? prev.selectedSize : "";
    return {
      souvenirId: souvenir.souvenirId,
      selectedSize: keep || (sizes.length === 1 ? sizes[0] : null),
    };
  });
}

function sameList(left: AdminSelectedSouvenir[], right: AdminSelectedSouvenir[]) {
  if (left.length !== right.length) return false;
  return left.every((item, index) => {
    const other = right[index];
    return (
      other?.souvenirId === item.souvenirId &&
      (other?.selectedSize ?? "") === (item.selectedSize ?? "")
    );
  });
}

function seedDraft(
  member: AdminOrganizationMember,
  eventId: string,
  organizationId: string,
  categories: RegistrationCategory[],
  detail: unknown,
): Draft {
  const base = mapOrganizationMemberToApplicationRow(member, eventId, organizationId);
  const row = detail ? applyRegistrationDetail(base, detail) : base;
  const category =
    findCategory(categories, row.eventCategoryId ?? "") ??
    findCategoryByLabel(categories, row.courseName ?? member.courseName ?? "");
  const birth = birthDigits(row.birth || member.birth || "");
  const listed = (row.selectedSouvenirList ?? []).filter((item) => item.souvenirId.trim());
  const souvenirs = category
    ? selectionsForCategory(
        category,
        listed.length
          ? listed
          : seedSingleSouvenir(category, member.souvenirSize, birth),
        birth,
      )
    : listed;
  const categoryId = category?.categoryId ?? "";
  return {
    registrationId: member.registrationId,
    name: member.name?.trim() || "이름 없음",
    eventCategoryId: categoryId,
    birth,
    souvenirs,
    baselineCategoryId: categoryId,
    baselineBirth: toApiBirth(birth),
    baselineSouvenirs: souvenirs,
  };
}

function seedSingleSouvenir(
  category: RegistrationCategory,
  size: string | null | undefined,
  birth: string,
) {
  const souvenirs = sortedSouvenirs(category);
  if (souvenirs.length !== 1) return [];
  const picked = (size ?? "").trim();
  const sizes = souvenirSizes(souvenirs[0], ticketFromBirthInput(birth));
  if (!picked || !sizes.includes(picked)) return [];
  return [{ souvenirId: souvenirs[0].souvenirId, selectedSize: picked }];
}

export function OrganizationPartialRefundEdit({
  eventId,
  organizationId,
  members,
  pending,
  result,
  onCancel,
  onSubmit,
}: Props) {
  const options = useQuery({
    queryKey: ["admin", "registration-options", eventId],
    queryFn: () => fetchAdminRegistrationOptions(eventId),
    enabled: Boolean(eventId),
  });
  const details = useQueries({
    queries: members.map((member) => ({
      queryKey: ["admin", "registration", member.registrationId],
      queryFn: () => fetchAdminRegistration(member.registrationId),
      enabled: Boolean(member.registrationId),
    })),
  });
  const categories = options.data?.categories ?? [];
  const loading = options.isLoading || details.some((query) => query.isLoading);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const seededKey = useRef("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, pending]);

  const memberKey = members.map((member) => member.registrationId).join(",");
  const detailStamp = details.map((query) => (query.isSuccess ? "1" : query.isError ? "e" : "0")).join("");

  useEffect(() => {
    if (loading || options.isError || !categories.length) return;
    const key = `${memberKey}:${detailStamp}:${categories.length}`;
    if (seededKey.current === key) return;
    seededKey.current = key;
    setDrafts(
      members.slice(0, TARGET_LIMIT).map((member, index) =>
        seedDraft(
          member,
          eventId,
          organizationId,
          categories,
          details[index]?.data,
        ),
      ),
    );
  }, [
    categories,
    detailStamp,
    details,
    eventId,
    loading,
    memberKey,
    members,
    options.isError,
    organizationId,
  ]);

  const updateDraft = (registrationId: string, patch: (draft: Draft) => Draft) => {
    setDrafts((prev) =>
      prev.map((draft) => (draft.registrationId === registrationId ? patch(draft) : draft)),
    );
  };

  const applyCategory = (draft: Draft, eventCategoryId: string, birth: string) => {
    const category = findCategory(categories, eventCategoryId);
    updateDraft(draft.registrationId, (current) => ({
      ...current,
      eventCategoryId,
      birth,
      souvenirs: category
        ? selectionsForCategory(category, current.souvenirs, birth)
        : current.souvenirs,
    }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!drafts.length) {
      setError("수정할 구성원이 없습니다.");
      return;
    }
    const targets: AdminPartialRefundTarget[] = [];
    for (const draft of drafts) {
      const category = findCategory(categories, draft.eventCategoryId);
      const digits = birthDigits(draft.birth);
      const apiBirth = digits.length === 8 ? toApiBirth(digits) : "";
      const souvenirs = category
        ? selectionsForCategory(category, draft.souvenirs, apiBirth || draft.birth)
        : draft.souvenirs;
      const changed =
        draft.baselineCategoryId !== draft.eventCategoryId ||
        draft.baselineBirth !== (apiBirth || draft.birth) ||
        !sameList(draft.baselineSouvenirs, souvenirs);
      if (!changed) continue;
      if (!category) {
        setError(`${draft.name} 종목을 선택하세요.`);
        return;
      }
      if (digits.length !== 8) {
        setError(`${draft.name} 생년월일 8자리를 입력하세요.`);
        return;
      }
      if (!categoryOpenForBirth(category, digits)) {
        setError(
          `${draft.name} ${categoryClosedReason(category, digits) || "참가할 수 없는 종목입니다."}`,
        );
        return;
      }
      if (souvenirs.some((item) => !item.souvenirId.trim())) {
        setError(`${draft.name} 기념품 ID를 확인할 수 없습니다.`);
        return;
      }
      const missingSize = sortedSouvenirs(category).some((souvenir) => {
        const sizes = souvenirSizes(souvenir, ticketFromBirthInput(digits));
        if (!sizes.length) return false;
        const picked = souvenirs.find((item) => item.souvenirId === souvenir.souvenirId);
        return !picked?.selectedSize;
      });
      if (missingSize) {
        setError(`${draft.name} 기념품 사이즈를 선택하세요.`);
        return;
      }
      targets.push({
        registrationId: draft.registrationId,
        eventCategoryId: draft.eventCategoryId,
        selectedSouvenirList: souvenirs,
        birth: apiBirth,
      });
    }
    if (!targets.length) {
      setError("변경된 구성원이 없습니다.");
      return;
    }
    if (targets.length > TARGET_LIMIT) {
      setError(`한 번에 ${TARGET_LIMIT}명까지 요청할 수 있습니다.`);
      return;
    }
    setError("");
    onSubmit(targets);
  };

  if (!mounted) return null;

  return createPortal(
    <div className="admin-drawer-stack">
      <div
        className="admin-drawer__dim"
        role="presentation"
        aria-hidden="true"
        onClick={() => {
          if (!pending) onCancel();
        }}
      />
      <aside
        className="admin-drawer admin-drawer--org-adjust"
        role="dialog"
        aria-modal="true"
        aria-label="결제연관정보 수정"
      >
        <header className="admin-drawer__hero">
          <div className="admin-drawer__hero-bar">
            <span className="admin-drawer__hero-kind">단체</span>
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={onCancel}
              disabled={pending}
            >
              닫기
            </button>
          </div>
          <h1 className="admin-drawer__hero-title">결제연관정보 수정</h1>
          {result ? null : (
            <p className="admin-org-adjust__note">
              바꾼 구성원만 한 요청으로 보냅니다. 금액이 줄어드는 변경만 환불되며, 같은 금액·추가
              납부는 처리되지 않습니다.
            </p>
          )}
        </header>
        {result ? (
          <div className="admin-org-adjust admin-org-adjust--result">
            <RefundResultPanel
              eventId={eventId}
              result={result}
              title="결제연관정보 처리 결과"
              onClose={onCancel}
            />
          </div>
        ) : (
    <form className="admin-org-adjust" onSubmit={submit} noValidate>
      {loading ? <p className="admin-pay__hint">구성원 신청 정보를 불러오는 중…</p> : null}
      {options.isError ? (
        <p className="admin-pay__hint">종목·기념품 목록을 불러오지 못했습니다.</p>
      ) : null}
      {members.length > TARGET_LIMIT ? (
        <p className="admin-pay__hint">한 요청에 {TARGET_LIMIT}명까지 포함됩니다.</p>
      ) : null}
      <div className="admin-org-adjust__table-wrap">
        <table className="admin-org-adjust__table">
          <thead>
            <tr>
              <th>이름</th>
              <th>종목</th>
              <th>생년월일</th>
              <th>기념품</th>
            </tr>
          </thead>
          <tbody>
            {drafts.map((draft) => {
              const category = findCategory(categories, draft.eventCategoryId);
              return (
                <tr key={draft.registrationId}>
                  <td>{draft.name}</td>
                  <td>
                    <select
                      className="admin-drawer__edit-input admin-drawer__edit-select"
                      value={draft.eventCategoryId}
                      disabled={!categories.length || pending}
                      onChange={(event) =>
                        applyCategory(draft, event.target.value, draft.birth)
                      }
                    >
                      <option value="">선택</option>
                      {categories.map((item) => {
                        const ageOff = !categoryOpenForBirth(item, draft.birth);
                        const closed = item.isActive === false;
                        const reason = closed
                          ? "마감"
                          : ageOff
                            ? categoryClosedReason(item, draft.birth)
                            : "";
                        return (
                          <option
                            key={item.categoryId}
                            value={item.categoryId}
                            disabled={closed || ageOff}
                          >
                            {categoryLabel(item)}
                            {reason ? ` (${reason})` : ""}
                          </option>
                        );
                      })}
                    </select>
                  </td>
                  <td>
                    <input
                      className="admin-drawer__edit-input"
                      value={draft.birth}
                      placeholder="YYYYMMDD"
                      inputMode="numeric"
                      disabled={pending}
                      onChange={(event) =>
                        applyCategory(
                          draft,
                          draft.eventCategoryId,
                          event.target.value.replace(/\D/g, "").slice(0, 8),
                        )
                      }
                    />
                  </td>
                  <td>
                    <div className="admin-org-adjust__souvenirs">
                      {sortedSouvenirs(category).map((souvenir) => {
                        const sizes = souvenirSizes(souvenir, ticketFromBirthInput(draft.birth));
                        const value =
                          draft.souvenirs.find((item) => item.souvenirId === souvenir.souvenirId)
                            ?.selectedSize ?? "";
                        return (
                          <label key={souvenir.souvenirId}>
                            <span>{souvenir.name || "기념품"}</span>
                            <select
                              className="admin-drawer__edit-input admin-drawer__edit-select"
                              value={value ?? ""}
                              disabled={pending}
                              onChange={(event) => {
                                const selectedSize = event.target.value || null;
                                updateDraft(draft.registrationId, (current) => ({
                                  ...current,
                                  souvenirs: current.souvenirs.some(
                                    (item) => item.souvenirId === souvenir.souvenirId,
                                  )
                                    ? current.souvenirs.map((item) =>
                                        item.souvenirId === souvenir.souvenirId
                                          ? { ...item, selectedSize }
                                          : item,
                                      )
                                    : [
                                        ...current.souvenirs,
                                        { souvenirId: souvenir.souvenirId, selectedSize },
                                      ],
                                }));
                              }}
                            >
                              <option value="">선택</option>
                              {sizes.map((size) => (
                                <option key={size} value={size}>
                                  {size}
                                </option>
                              ))}
                            </select>
                          </label>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {error ? <p className="admin-org-adjust__error">{error}</p> : null}
      <div className="admin-org-adjust__actions">
        <button type="button" className="admin-btn admin-btn--ghost" onClick={onCancel}>
          취소
        </button>
        <button
          type="submit"
          className="admin-btn admin-btn--primary"
          disabled={pending || loading || !categories.length || !drafts.length}
        >
          변경 요청
        </button>
      </div>
    </form>
        )}
      </aside>
    </div>,
    document.body,
  );
}
