"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BirthPick,
  FormRow,
  FormSec,
  GenderPick,
  PhoneField,
} from "@/components/main/register/ApplyUi";
import { useRegistrationOptions } from "@/components/main/register/useRegistrationOptions";
import { VIRTUAL_RUN_EVENT_ID } from "@/lib/main/config";
import { MainHttpError } from "@/lib/main/fetch";
import {
  categoryLabel,
  findCategory,
  packageChildCategories,
} from "@/lib/registration-options";
import { uiGenderFromApi } from "@/lib/registration-gender";
import { filterNoSpaceName, formatFee, type Gender } from "@/lib/register";
import { VR_ASSEMBLE_PACKAGE } from "@/lib/virtual-run/packages";
import { readLoginSession } from "@/lib/virtual-run/login-session";
import { toPackageUpgradeEntries, type VirtualRunRecipientDraft } from "@/lib/virtual-run/purchase";
import { saveVirtualRunTicketPending } from "@/lib/virtual-run/ticket-payment";
import {
  cancelPackageUpgrade,
  fetchParticipantEntries,
  fetchParticipantOrder,
  fetchPendingPackageUpgrade,
  reopenPackageUpgradePayment,
  requestPackageUpgrade,
  type ParticipantEntry,
} from "@/services/main/participant-auth";
import type { ParticipantOrder, ParticipantOrderItem } from "@/services/main/participant-orders";
import type { PackageUpgradeOrder } from "@/services/main/types";
import { useVrPath, VrLink } from "../layout/VrLink";
import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { VrMypageGate } from "./VrMypageGate";

type RecipientRow = VirtualRunRecipientDraft & { sameAs: boolean };

function errorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) return error.message.trim();
  return "패키지 상향을 처리하지 못했습니다.";
}

function birthDigits(value?: string | null) {
  return (value ?? "").replace(/\D/g, "").slice(0, 8);
}

function roundAccent(categoryId: string, categoryName: string, index: number) {
  const text = `${categoryId} ${categoryName}`.toLowerCase();
  if (text.includes("avenger") || categoryName.includes("어벤")) return "gold";
  if (text.includes("xmen") || text.includes("x-men") || categoryName.includes("엑스")) return "red";
  if (text.includes("fantastic") || categoryName.includes("판타")) return "blue";
  return (["gold", "red", "blue"] as const)[index % 3];
}

function themeName(categoryId: string, categoryName: string) {
  const text = `${categoryId} ${categoryName}`.toLowerCase();
  if (text.includes("avenger") || categoryName.includes("어벤")) return "어벤져스";
  if (text.includes("xmen") || text.includes("x-men") || categoryName.includes("엑스")) return "엑스맨";
  if (text.includes("fantastic") || categoryName.includes("판타")) return "판타스틱4";
  return categoryName;
}

function birthLabel(ymd: string) {
  if (!/^\d{8}$/.test(ymd)) return "";
  return `${ymd.slice(0, 4)}.${ymd.slice(4, 6)}.${ymd.slice(6, 8)}`;
}

function genderLabel(gender: Gender | "") {
  if (gender === "male") return "남성";
  if (gender === "female") return "여성";
  return "";
}

function itemLabel(item: ParticipantOrderItem) {
  const name = item.eventCategoryName || "단품";
  return item.amount > 0 ? `${name} · ${formatFee(item.amount)}` : name;
}

function phoneLabel(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  return digits;
}

export function VirtualRunPackageUpgrade() {
  const router = useRouter();
  const toHref = useVrPath();
  const options = useRegistrationOptions(VIRTUAL_RUN_EVENT_ID);
  const [entries, setEntries] = useState<ParticipantEntry[]>([]);
  const [order, setOrder] = useState<ParticipantOrder | null>(null);
  const [itemId, setItemId] = useState("");
  const [pending, setPending] = useState<PackageUpgradeOrder | null>(null);
  const [canceled, setCanceled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [recipients, setRecipients] = useState<RecipientRow[]>([]);

  useEffect(() => {
    const session = readLoginSession();
    if (!session?.tokens?.accessToken || !VIRTUAL_RUN_EVENT_ID) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    Promise.all([
      fetchParticipantEntries(),
      fetchPendingPackageUpgrade(),
      fetchParticipantOrder(session.registrationId),
    ])
      .then(([rows, order, current]) => {
        if (cancelled) return;
        setEntries(rows);
        setOrder(current);
        setPending(order);
        setCanceled(current.canceled);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const singles = useMemo(() => {
    const living = (order?.items ?? []).filter((item) => !item.canceledAt);
    const typed = living.filter((item) => item.productType === "SINGLE");
    if (typed.length || living.some((item) => item.productType)) return typed;
    return living.filter((item) => {
      const category = findCategory(options.categories, item.eventCategoryId);
      return category?.productType === "SINGLE";
    });
  }, [order, options.categories]);
  const selectedItem =
    singles.find((item) => item.itemId === itemId) ?? singles[0];
  const category = findCategory(options.categories, selectedItem?.eventCategoryId || "");
  const targetId = category?.parentCategoryId?.trim() || "";
  const target = targetId ? findCategory(options.categories, targetId) : undefined;
  const others = useMemo(
    () =>
      target
        ? packageChildCategories(options.categories, target.categoryId).filter(
            (child) => child.categoryId !== category?.categoryId,
          )
        : [],
    [options.categories, target, category?.categoryId],
  );

  useEffect(() => {
    if (!selectedItem?.itemId) return;
    setItemId((current) => (current === selectedItem.itemId ? current : selectedItem.itemId));
  }, [selectedItem?.itemId]);

  useEffect(() => {
    setRecipients((prev) => {
      if (
        prev.length === others.length &&
        others.every((child) => prev.some((row) => row.eventCategoryId === child.categoryId))
      ) {
        return prev;
      }
      return others.map((child) => ({
        eventCategoryId: child.categoryId,
        sameAs: false,
        name: "",
        phone: "",
        birth: "",
        gender: "",
      }));
    });
  }, [others]);

  const session = readLoginSession();
  const applicantEntry =
    entries.find((entry) => entry.phNum === (session?.access.phNum ?? "").replace(/\D/g, "")) ??
    entries[0];
  const applicant = {
    name: session?.access.name.trim() || applicantEntry?.name || "",
    phone: session?.access.phNum || applicantEntry?.phNum || "",
    birth: birthDigits(session?.access.birth || applicantEntry?.birth),
    gender: (uiGenderFromApi(applicantEntry?.gender) ?? "") as Gender | "",
  };
  const alreadyPackage =
    singles.length === 0 &&
    (order?.items ?? []).some(
      (item) => !item.canceledAt && item.productType === "PACKAGE",
    );
  const loggedOut = !readLoginSession()?.tokens?.accessToken;

  function openPayment(order: PackageUpgradeOrder) {
    const session = readLoginSession();
    saveVirtualRunTicketPending({
      registration: {
        orderId: order.orderId,
        orderName: order.orderName || order.targetCategoryName || "패키지 상향",
        paymentAmount: order.amount,
      },
      customerName: session?.access.name || applicant.name,
      phone: session?.access.phNum || applicant.phone,
      kind: "package",
      roundIds: [],
      savedAt: Date.now(),
    });
    router.push(toHref("/payment"));
  }

  async function onResume() {
    if (busy) return;
    setBusy(true);
    try {
      openPayment(await reopenPackageUpgradePayment());
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  async function onCancel() {
    if (busy) return;
    setBusy(true);
    try {
      await cancelPackageUpgrade();
      setPending(null);
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const entries = toPackageUpgradeEntries(
        recipients.map((row) =>
          row.sameAs
            ? { ...row, ...applicant, eventCategoryId: row.eventCategoryId }
            : row,
        ),
      );
      if (!selectedItem?.itemId) {
        setError("상향할 단품을 선택하세요.");
        setBusy(false);
        return;
      }
      openPayment(await requestPackageUpgrade(entries, selectedItem.itemId));
    } catch (err) {
      setError(err instanceof MainHttpError || err instanceof Error ? errorMessage(err) : errorMessage(err));
      setBusy(false);
    }
  }

  function patchRecipient(eventCategoryId: string, patch: Partial<RecipientRow>) {
    setRecipients((prev) =>
      prev.map((row) =>
        row.eventCategoryId === eventCategoryId ? { ...row, ...patch, sameAs: false } : row,
      ),
    );
  }

  return (
    <VirtualRunSubPage kicker="UPGRADE" title="패키지 상향" en="SINGLE TO PACKAGE">
      <div className="page__body wrap wrap--narrow">
        <VrMypageGate>
          {loading || options.loading ? (
            <p className="form__note">신청 정보를 불러오는 중...</p>
          ) : loggedOut ? (
            <section className="block wait">
              <h2>다시 로그인해 주세요</h2>
              <p className="sec__body">패키지 상향은 참가자 로그인 뒤에 할 수 있습니다.</p>
              <div className="flow__nav">
                <VrLink href="/login" className="btn btn--red">
                  로그인
                </VrLink>
              </div>
            </section>
          ) : canceled ? (
            <section className="block wait">
              <h2>취소한 주문입니다</h2>
              <p className="sec__body">취소한 주문은 패키지로 상향할 수 없습니다.</p>
              <div className="flow__nav">
                <VrLink href="/mypage" className="btn btn--ghost">
                  마이페이지
                </VrLink>
              </div>
            </section>
          ) : pending ? (
            <section className="ticket">
              <p className="kicker">PENDING</p>
              <h2>
                패키지 상향 <em>대기</em>
              </h2>
              <dl className="spec">
                <div>
                  <dt>바꿀 티켓</dt>
                  <dd>{pending.targetCategoryName || target?.categoryName || "패키지"}</dd>
                </div>
                <div>
                  <dt>차액</dt>
                  <dd>{formatFee(pending.amount)}</dd>
                </div>
              </dl>
              {error ? (
                <p className="form__err" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="flow__nav">
                <button type="button" className="btn btn--ghost" disabled={busy} onClick={() => void onCancel()}>
                  상향 취소
                </button>
                <button type="button" className="btn btn--red" disabled={busy} onClick={() => void onResume()}>
                  {busy ? "확인 중..." : "결제 이어하기"}
                </button>
              </div>
            </section>
          ) : alreadyPackage ? (
            <section className="block wait">
              <h2>이미 패키지 티켓입니다</h2>
              <p className="sec__body">단품을 패키지로 올리는 신청만 할 수 있습니다.</p>
              <div className="flow__nav">
                <VrLink href="/mypage" className="btn btn--red">
                  마이페이지
                </VrLink>
              </div>
            </section>
          ) : !target || !others.length ? (
            <section className="block wait">
              <h2>상향할 패키지가 없습니다</h2>
              <p className="sec__body">
                {error || options.errorMessage || "결제를 마친 단품 신청만 패키지로 올릴 수 있습니다."}
              </p>
              <div className="flow__nav">
                <VrLink href="/mypage" className="btn btn--red">
                  마이페이지
                </VrLink>
              </div>
            </section>
          ) : (
            <form className="form vr-edit-runners" onSubmit={(event) => void onSubmit(event)} noValidate>
              <FormSec
                kicker="02 / RUNNER"
                title="패키지별 참가자"
                note="지금 단품을 뺀 회차의 참가자를 입력합니다. 신청자와 같으면 체크합니다. 배송지는 신청한 주소 그대로입니다."
              >
                {singles.length > 1 ? (
                  <FormRow label="상향할 단품">
                    <select
                      className="vr-order__select"
                      value={selectedItem?.itemId ?? ""}
                      disabled={busy}
                      onChange={(event) => setItemId(event.target.value)}
                    >
                      {singles.map((item) => (
                        <option key={item.itemId} value={item.itemId}>
                          {itemLabel(item)}
                        </option>
                      ))}
                    </select>
                  </FormRow>
                ) : (
                  <FormRow label="지금 티켓" locked>
                    <p className="form-row__hint">
                      {selectedItem ? itemLabel(selectedItem) : category ? categoryLabel(category) : "단품"}
                    </p>
                  </FormRow>
                )}
                {others.length > 1 ? (
                  <div className="vr-recipients__all">
                    <label className={`vr-recipients__same${recipients.length > 0 && recipients.every((row) => row.sameAs) ? " is-on" : ""}`}>
                      <input
                        type="checkbox"
                        checked={recipients.length > 0 && recipients.every((row) => row.sameAs)}
                        disabled={busy}
                        onChange={(e) => {
                          const sameAs = e.target.checked;
                          setRecipients((prev) =>
                            prev.map((item) => ({
                              ...item,
                              sameAs,
                              ...(sameAs ? applicant : {}),
                            })),
                          );
                        }}
                      />
                      모두 신청자와 동일
                    </label>
                  </div>
                ) : null}
                <ul className="vr-pkg-lines">
                  <li className={`is-${VR_ASSEMBLE_PACKAGE.accent}`}>
                    <img src={VR_ASSEMBLE_PACKAGE.image} alt="" width={72} height={72} />
                    <div className="vr-pkg-lines__body">
                      <div className="vr-pkg-lines__head">
                        <strong>1. {VR_ASSEMBLE_PACKAGE.name}</strong>
                      </div>
                      <div className="vr-pkg-lines__themes">
                        {others.map((child, index) => {
                          const row =
                            recipients.find((item) => item.eventCategoryId === child.categoryId) ??
                            ({
                              eventCategoryId: child.categoryId,
                              sameAs: false,
                              name: "",
                              phone: "",
                              birth: "",
                              gender: "",
                            } satisfies RecipientRow);
                          const shown = row.sameAs ? { ...row, ...applicant } : row;
                          return (
                            <div
                              key={child.categoryId}
                              className={`vr-pkg-lines__theme is-${roundAccent(child.categoryId, child.categoryName, index)}`}
                            >
                              <strong>{themeName(child.categoryId, child.categoryName)}</strong>
                              <label className={`vr-recipients__same${row.sameAs ? " is-on" : ""}`}>
                                <input
                                  type="checkbox"
                                  checked={row.sameAs}
                                  disabled={busy}
                                  onChange={(e) => {
                                    const sameAs = e.target.checked;
                                    setRecipients((prev) =>
                                      prev.map((item) =>
                                        item.eventCategoryId === child.categoryId
                                          ? {
                                              ...item,
                                              sameAs,
                                              ...(sameAs ? applicant : {}),
                                            }
                                          : item,
                                      ),
                                    );
                                  }}
                                />
                                신청자와 동일
                              </label>
                              {row.sameAs ? (
                                <p className="vr-pkg-lines__same">
                                  {shown.name || "신청자"}
                                  {" · "}
                                  {birthLabel(birthDigits(shown.birth)) || "생년월일"}
                                  {" · "}
                                  {genderLabel(shown.gender) || "성별"}
                                  {" · "}
                                  {phoneLabel(shown.phone) || "휴대폰"}
                                </p>
                              ) : (
                                <>
                                  <FormRow label="이름" required>
                                    <input
                                      type="text"
                                      value={shown.name}
                                      maxLength={50}
                                      placeholder="참가 이름"
                                      disabled={busy}
                                      onChange={(e) =>
                                        patchRecipient(child.categoryId, {
                                          name: filterNoSpaceName(e.target.value),
                                        })
                                      }
                                    />
                                  </FormRow>
                                  <FormRow label="생년월일" required>
                                    <BirthPick
                                      value={shown.birth}
                                      disabled={busy}
                                      onChange={(birth) => patchRecipient(child.categoryId, { birth })}
                                    />
                                  </FormRow>
                                  <FormRow label="휴대폰 번호" required>
                                    <PhoneField
                                      value={shown.phone}
                                      placeholder="010-0000-0000"
                                      disabled={busy}
                                      onChange={(phone) => patchRecipient(child.categoryId, { phone })}
                                    />
                                  </FormRow>
                                  <FormRow label="성별" required>
                                    <GenderPick
                                      name={`gender-${child.categoryId}`}
                                      value={shown.gender}
                                      disabled={busy}
                                      onChange={(gender) => patchRecipient(child.categoryId, { gender })}
                                    />
                                  </FormRow>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </li>
                </ul>
              </FormSec>
              {error ? (
                <p className="form__err" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="flow__nav">
                <button type="submit" className="btn btn--red" disabled={busy}>
                  {busy ? "확인 중..." : "차액 결제"}
                </button>
              </div>
            </form>
          )}
        </VrMypageGate>
      </div>
    </VirtualRunSubPage>
  );
}
