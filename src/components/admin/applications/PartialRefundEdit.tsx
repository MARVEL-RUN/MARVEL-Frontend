"use client";

import {
  categoryClosedReason,
  categoryLabel,
  categoryOpenForBirth,
  findCategory,
  shirtAssignment,
  shirtSouvenir,
  souvenirSizes,
  sortedSouvenirs,
} from "@/lib/registration-options";
import { ticketForBirth } from "@/lib/register";
import { fetchAdminRegistrationOptions } from "@/services/admin/registration-options";
import {
  hasPartialRefundIds,
  type AdminApplicationRow,
  type AdminSelectedSouvenir,
} from "@/services/admin/applications";
import type { AdminPartialRefundTarget } from "@/services/admin/refunds";
import type { RegistrationCategory } from "@/services/main/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent } from "react";

type Props = {
  row: AdminApplicationRow;
  pending?: boolean;
  onCancel: () => void;
  onError: (message: string) => void;
  onSubmit: (target: AdminPartialRefundTarget) => void;
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

function birthHint(raw: string) {
  const digits = birthDigits(raw);
  if (digits.length !== 8) return "YYYYMMDD 8자리";
  return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}`;
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

function sameSelection(
  row: AdminApplicationRow,
  eventCategoryId: string,
  birth: string,
  souvenirs: AdminSelectedSouvenir[],
) {
  const currentBirth = toApiBirth((row.birth ?? "").replace(/\D/g, "").slice(0, 8) || row.birth || "");
  if ((row.eventCategoryId ?? "") !== eventCategoryId) return false;
  if (currentBirth !== birth) return false;
  const current = row.selectedSouvenirList ?? [];
  if (current.length !== souvenirs.length) return false;
  return souvenirs.every((item, index) => {
    const prev = current[index];
    return (
      prev?.souvenirId === item.souvenirId &&
      (prev?.selectedSize ?? "") === (item.selectedSize ?? "")
    );
  });
}

export function PartialRefundEdit({ row, pending, onCancel, onError, onSubmit }: Props) {
  const options = useQuery({
    queryKey: ["admin", "registration-options", row.eventId],
    queryFn: () => fetchAdminRegistrationOptions(row.eventId),
    enabled: Boolean(row.eventId),
  });

  const categories = options.data?.categories ?? [];
  const initialCategoryId = row.eventCategoryId ?? "";
  const initialBirth = (row.birth ?? "").replace(/\D/g, "").slice(0, 8);
  const [eventCategoryId, setEventCategoryId] = useState(initialCategoryId);
  const [birth, setBirth] = useState(initialBirth);
  const [souvenirs, setSouvenirs] = useState<AdminSelectedSouvenir[]>(
    () => row.selectedSouvenirList ?? [],
  );

  const category = useMemo(
    () => findCategory(categories, eventCategoryId),
    [categories, eventCategoryId],
  );

  const applyCategory = (nextId: string, nextBirth: string) => {
    const next = findCategory(categories, nextId);
    const open = Boolean(next && categoryOpenForBirth(next, nextBirth));
    setBirth(nextBirth);
    if (!next || !open) {
      setEventCategoryId("");
      if (next && !open) setSouvenirs([]);
      return;
    }
    setEventCategoryId(nextId);
    setSouvenirs(selectionsForCategory(next, souvenirs, nextBirth));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!hasPartialRefundIds(row)) {
      onError("상세에 종목·기념품 ID가 없습니다.");
      return;
    }
    if (options.isError || !categories.length) {
      onError("종목·기념품 목록을 먼저 불러오세요.");
      return;
    }
    if (!category) {
      onError("참가 종목을 선택하세요.");
      return;
    }
    if (!categoryOpenForBirth(category, birthDigits(birth))) {
      onError(categoryClosedReason(category, birthDigits(birth)) || "참가할 수 없는 종목입니다.");
      return;
    }
    const apiBirth = toApiBirth(birth);
    if (birth.replace(/\D/g, "").length !== 8) {
      onError("생년월일 8자리를 입력하세요.");
      return;
    }
    const nextSouvenirs = selectionsForCategory(category, souvenirs, apiBirth);
    if (nextSouvenirs.some((item) => !item.souvenirId.trim())) {
      onError("기념품 ID를 확인할 수 없습니다.");
      return;
    }
    if (nextSouvenirs.some((item) => item.selectedSize != null && item.selectedSize === "")) {
      onError("기념품 사이즈를 선택하세요.");
      return;
    }
    const missingSize = sortedSouvenirs(category).some((souvenir) => {
      const sizes = souvenirSizes(souvenir, ticketFromBirthInput(birth));
      if (!sizes.length) return false;
      const picked = nextSouvenirs.find((item) => item.souvenirId === souvenir.souvenirId);
      return !picked?.selectedSize;
    });
    if (missingSize) {
      onError("기념품 사이즈를 선택하세요.");
      return;
    }
    if (sameSelection(row, eventCategoryId, apiBirth, nextSouvenirs)) {
      onError("변경된 종목·기념품이 없습니다.");
      return;
    }
    onError("");
    onSubmit({
      registrationId: row.id,
      eventCategoryId,
      selectedSouvenirList: nextSouvenirs,
      birth: apiBirth,
    });
  };

  return (
    <form className="admin-drawer__edit" onSubmit={submit} noValidate>
      <p className="admin-drawer__edit-note">
        종목·기념품·생년월일 변경을 요청합니다. 금액이 줄어드는 경우만 환불되며, 같은
        금액·추가 납부는 처리되지 않습니다.
      </p>
      {options.isLoading ? <p className="admin-pay__hint">종목 목록을 불러오는 중…</p> : null}
      {options.isError ? (
        <p className="admin-pay__hint">종목·기념품 목록을 불러오지 못했습니다.</p>
      ) : null}
      <section className="admin-drawer__section">
        <h2 className="admin-drawer__section-title">참가 정보</h2>
        <div className="admin-drawer__edit-fields">
          <div className="admin-drawer__edit-row">
            <div className="admin-drawer__edit-label">
              <span>종목</span>
            </div>
            <div className="admin-drawer__edit-value">
              <select
                className="admin-drawer__edit-input admin-drawer__edit-select"
                value={eventCategoryId}
                disabled={!categories.length}
                onChange={(event) => applyCategory(event.target.value, birth)}
              >
                <option value="">선택</option>
                {categories.map((item) => {
                  const ageOff = !categoryOpenForBirth(item, birth);
                  const closed = item.isActive === false;
                  const reason = closed
                    ? "마감"
                    : ageOff
                      ? categoryClosedReason(item, birth)
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
            </div>
          </div>
          <div className="admin-drawer__edit-row">
            <div className="admin-drawer__edit-label">
              <span>생년월일</span>
              <span className="admin-drawer__edit-hint">{birthHint(birth)}</span>
            </div>
            <div className="admin-drawer__edit-value">
              <input
                className="admin-drawer__edit-input"
                value={birth}
                placeholder="YYYYMMDD"
                inputMode="numeric"
                onChange={(event) => applyCategory(eventCategoryId, event.target.value.replace(/\D/g, "").slice(0, 8))}
              />
            </div>
          </div>
          {sortedSouvenirs(category).map((souvenir) => {
            const sizes = souvenirSizes(souvenir, ticketFromBirthInput(birth));
            const value =
              souvenirs.find((item) => item.souvenirId === souvenir.souvenirId)?.selectedSize ?? "";
            return (
              <div className="admin-drawer__edit-row" key={souvenir.souvenirId}>
                <div className="admin-drawer__edit-label">
                  <span>{souvenir.name || "기념품"}</span>
                </div>
                <div className="admin-drawer__edit-value">
                  <select
                    className="admin-drawer__edit-input admin-drawer__edit-select"
                    value={value ?? ""}
                    onChange={(event) =>
                      setSouvenirs((prev) => {
                        const selectedSize = event.target.value || null;
                        if (prev.some((item) => item.souvenirId === souvenir.souvenirId)) {
                          return prev.map((item) =>
                            item.souvenirId === souvenir.souvenirId
                              ? { ...item, selectedSize }
                              : item,
                          );
                        }
                        return [...prev, { souvenirId: souvenir.souvenirId, selectedSize }];
                      })
                    }
                  >
                    <option value="">선택</option>
                    {sizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <div className="admin-drawer__edit-foot">
        <button type="button" className="admin-btn admin-btn--ghost" onClick={onCancel}>
          취소
        </button>
        <button
          type="submit"
          className="admin-btn admin-btn--primary"
          disabled={pending || options.isLoading || !categories.length}
        >
          변경 요청
        </button>
      </div>
    </form>
  );
}
