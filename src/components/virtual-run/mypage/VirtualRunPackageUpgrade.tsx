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
import { formatFee, type Gender } from "@/lib/register";
import { readLoginSession } from "@/lib/virtual-run/login-session";
import { toPackageUpgradeEntries, type VirtualRunRecipientDraft } from "@/lib/virtual-run/purchase";
import { saveVirtualRunTicketPending } from "@/lib/virtual-run/ticket-payment";
import {
  cancelPackageUpgrade,
  reopenPackageUpgradePayment,
  requestPackageUpgrade,
} from "@/services/main/participant-auth";
import { lookupIndividualRegistrations } from "@/services/main/registrations";
import type { PackageUpgradeOrder, RegistrationReceipt } from "@/services/main/types";
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

function pickReceipt(rows: RegistrationReceipt[]) {
  return rows.find((row) => row.registrationId?.trim()) ?? rows[0] ?? null;
}

function roundAccent(categoryId: string, categoryName: string, index: number) {
  const text = `${categoryId} ${categoryName}`.toLowerCase();
  if (text.includes("avenger") || categoryName.includes("어벤")) return "gold";
  if (text.includes("xmen") || text.includes("x-men") || categoryName.includes("엑스")) return "red";
  if (text.includes("fantastic") || categoryName.includes("판타")) return "blue";
  return (["gold", "red", "blue"] as const)[index % 3];
}

export function VirtualRunPackageUpgrade() {
  const router = useRouter();
  const toHref = useVrPath();
  const options = useRegistrationOptions(VIRTUAL_RUN_EVENT_ID);
  const [receipt, setReceipt] = useState<RegistrationReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [recipients, setRecipients] = useState<RecipientRow[]>([]);

  useEffect(() => {
    const session = readLoginSession();
    if (!session || !VIRTUAL_RUN_EVENT_ID) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    lookupIndividualRegistrations(VIRTUAL_RUN_EVENT_ID, session.access)
      .then((found) => {
        if (cancelled) return;
        setReceipt(pickReceipt(found));
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

  const category = findCategory(options.categories, receipt?.eventCategoryId || "");
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

  const applicant = {
    name: receipt?.name?.trim() || "",
    phone: receipt?.phNum?.trim() || "",
    birth: birthDigits(receipt?.birth),
    gender: (uiGenderFromApi(receipt?.gender) ?? "") as Gender | "",
  };
  const pending = receipt?.pendingUpgrade ?? null;
  const alreadyPackage = category?.productType === "PACKAGE";
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
      const session = readLoginSession();
      if (session && VIRTUAL_RUN_EVENT_ID) {
        const found = await lookupIndividualRegistrations(VIRTUAL_RUN_EVENT_ID, session.access);
        setReceipt(pickReceipt(found));
      }
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
      openPayment(await requestPackageUpgrade(entries));
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
              <h2>신청 정보를 찾지 못했습니다</h2>
              <p className="sec__body">패키지 상향은 신청 정보가 있을 때 진행할 수 있습니다.</p>
              <div className="flow__nav">
                <VrLink href="/mypage" className="btn btn--red">
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
            <form className="form" onSubmit={(event) => void onSubmit(event)} noValidate>
              <FormSec
                title={target.categoryName || "패키지"}
                note="지금 단품을 뺀 회차의 참가자를 입력합니다. 배송지는 신청한 주소 그대로입니다."
              >
                <FormRow label="지금 티켓" locked>
                  <p className="form-row__hint">{category ? categoryLabel(category) : "단품"}</p>
                </FormRow>
              </FormSec>
              <ul className="vr-recipients">
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
                    <li key={child.categoryId} className={`is-${roundAccent(child.categoryId, child.categoryName, index)}`}>
                      <div className="vr-recipients__head">
                        <strong>{categoryLabel(child)}</strong>
                        <label className={`vr-recipients__same${row.sameAs ? " is-on" : ""}`}>
                          <input
                            type="checkbox"
                            checked={row.sameAs}
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
                          신청자 정보와 동일
                        </label>
                      </div>
                      <FormRow label="이름" required>
                        <input
                          type="text"
                          value={shown.name}
                          onChange={(e) => patchRecipient(child.categoryId, { name: e.target.value })}
                        />
                      </FormRow>
                      <FormRow label="생년월일" required>
                        <BirthPick
                          value={shown.birth}
                          onChange={(birth) => patchRecipient(child.categoryId, { birth })}
                        />
                      </FormRow>
                      <FormRow label="휴대폰 번호" required>
                        <PhoneField
                          value={shown.phone}
                          onChange={(phone) => patchRecipient(child.categoryId, { phone })}
                        />
                      </FormRow>
                      <FormRow label="성별" required>
                        <GenderPick
                          name={`gender-${child.categoryId}`}
                          value={shown.gender}
                          onChange={(gender) => patchRecipient(child.categoryId, { gender })}
                        />
                      </FormRow>
                    </li>
                  );
                })}
              </ul>
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
