"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PaymentWidget } from "@/components/main/payment/PaymentWidget";
import {
  AddressField,
  BirthPick,
  FormRow,
  FormSec,
  GenderPick,
  PasswordField,
  PhoneField,
} from "@/components/main/register/ApplyUi";
import { RegistrationPolicyNotice } from "@/components/main/register/RegistrationPolicyNotice";
import { useRegistrationOptions } from "@/components/main/register/useRegistrationOptions";
import { SheetModal } from "@/components/main/SheetModal";
import { hasTossClientKey, VIRTUAL_RUN_EVENT_ID } from "@/lib/main/config";
import { MainHttpError } from "@/lib/main/fetch";
import type { PaymentOrder } from "@/lib/payment/session";
import { filterNoSpaceName, formatPhone, type Consents, type Gender } from "@/lib/register";
import { isMobileView } from "@/lib/viewport";
import {
  VR_ASSEMBLE_PACKAGE,
  VR_SINGLE_PACKAGES,
  vrPackageById,
  vrPackageOrderName,
  vrPackageRoundIds,
  vrPackageTicketKind,
  vrPackageTotal,
  vrSingleOverlapNote,
  type VrPackage,
  type VrPackageId,
} from "@/lib/virtual-run/packages";
import {
  virtualRunEntryCategory,
  virtualRunProductForPackage,
} from "@/lib/virtual-run/product-match";
import { toVirtualRunItemsRequest } from "@/lib/virtual-run/purchase";
import { virtualRunRoundById, type VirtualRunRoundId } from "@/lib/virtual-run/rounds";
import { virtualRunDemoEnabled } from "@/lib/virtual-run/site";
import { saveVirtualRunTicketPending } from "@/lib/virtual-run/ticket-payment";
import { submitVirtualRunRegistration } from "@/services/main/participant-auth";
import { useVrPath } from "../layout/VrLink";

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const ITEM_LIMIT = 10;

type RunnerSlot = {
  id: string;
  themeId: VirtualRunRoundId;
  theme: string;
  name: string;
  phone: string;
  birth: string;
  gender: Gender | "";
  sameAs: boolean;
};

type PackageLine = {
  id: string;
  packageId: VrPackageId;
  runners: RunnerSlot[];
};

type PersonDraft = {
  name: string;
  phone: string;
  birth: string;
  gender: Gender | "";
};

const phoneDigits = (value: string) => value.replace(/\D/g, "");

function birthLabel(ymd: string) {
  if (!/^\d{8}$/.test(ymd)) return "";
  return `${ymd.slice(0, 4)}.${ymd.slice(4, 6)}.${ymd.slice(6, 8)}`;
}

function genderLabel(gender: Gender | "") {
  if (gender === "male") return "남성";
  if (gender === "female") return "여성";
  return "";
}

function personIssue(label: string, person: PersonDraft) {
  const name = filterNoSpaceName(person.name);
  if (!name) return `${label} 이름을 입력해 주세요.`;
  if (name.length > 50) return `${label} 이름은 50자까지 입력할 수 있습니다.`;
  if (!/^\d{8}$/.test(person.birth)) return `${label} 생년월일을 입력해 주세요.`;
  const digits = phoneDigits(person.phone);
  if (digits.length < 10 || digits.length > 14) return `${label} 휴대폰 번호를 확인해 주세요.`;
  if (person.gender !== "male" && person.gender !== "female") {
    return `${label} 성별을 선택해 주세요.`;
  }
  return "";
}

function emptyRunner(themeId: VirtualRunRoundId): RunnerSlot {
  const round = virtualRunRoundById(themeId);
  return {
    id: crypto.randomUUID(),
    themeId,
    theme: round.theme,
    name: "",
    phone: "",
    birth: "",
    gender: "",
    sameAs: false,
  };
}

function emptyLine(packageId: VrPackageId): PackageLine {
  return {
    id: crypto.randomUUID(),
    packageId,
    runners: vrPackageById(packageId).roundIds.map((themeId) => emptyRunner(themeId)),
  };
}

function runnerEmpty(slot: RunnerSlot) {
  return !slot.name.trim() && !slot.phone.trim() && !slot.birth && !slot.gender && !slot.sameAs;
}

function countOf(lines: PackageLine[], packageId: VrPackageId) {
  return lines.filter((line) => line.packageId === packageId).length;
}

export function VirtualRunPackageForm({
  consents,
  onBack,
}: {
  consents: Consents;
  onBack: () => void;
}) {
  const router = useRouter();
  const toHref = useVrPath();
  const options = useRegistrationOptions(VIRTUAL_RUN_EVENT_ID);
  const [lines, setLines] = useState<PackageLine[]>([]);
  const [buyerName, setBuyerName] = useState("");
  const [phone, setPhone] = useState("");
  const [buyerBirth, setBuyerBirth] = useState("");
  const [buyerGender, setBuyerGender] = useState<Gender | "">("");
  const [password, setPassword] = useState("");
  const [addr, setAddr] = useState({ zonecode: "", address: "", addressDetail: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [payOrder, setPayOrder] = useState<PaymentOrder | null>(null);
  const [payName, setPayName] = useState("");

  const total = vrPackageTotal(lines);
  const overlapNote = vrSingleOverlapNote(lines);
  const runnerCount = lines.reduce((sum, line) => sum + line.runners.length, 0);
  const allSame = runnerCount > 0 && lines.every((line) => line.runners.every((slot) => slot.sameAs));

  const buyer: PersonDraft = {
    name: buyerName,
    phone,
    birth: buyerBirth,
    gender: buyerGender,
  };

  const resolved = useMemo(
    () =>
      lines.map((line) => ({
        ...line,
        pkg: vrPackageById(line.packageId),
        runners: line.runners.map((slot) => {
          const person = slot.sameAs
            ? { name: buyerName, phone, birth: buyerBirth, gender: buyerGender }
            : slot;
          return {
            ...slot,
            runnerName: filterNoSpaceName(person.name),
            runnerPhone: phoneDigits(person.phone),
            runnerBirth: person.birth,
            runnerGender: person.gender,
          };
        }),
      })),
    [buyerBirth, buyerGender, buyerName, lines, phone],
  );

  function setQty(packageId: VrPackageId, delta: number) {
    if (delta > 0 && lines.length >= ITEM_LIMIT) {
      setError("한 신청에 상품은 10개까지 담을 수 있습니다.");
      return;
    }
    setError("");
    setLines((prev) => {
      const ofType = prev.filter((line) => line.packageId === packageId);
      if (delta > 0) {
        if (prev.length >= ITEM_LIMIT) return prev;
        return [...prev, emptyLine(packageId)];
      }
      if (!ofType.length) return prev;
      const empty = [...ofType].reverse().find((line) => line.runners.every(runnerEmpty));
      const target = empty ?? ofType[ofType.length - 1];
      return prev.filter((line) => line.id !== target.id);
    });
  }

  function patchRunner(lineId: string, runnerId: string, patch: Partial<RunnerSlot>) {
    setLines((prev) =>
      prev.map((line) =>
        line.id === lineId
          ? {
              ...line,
              runners: line.runners.map((slot) =>
                slot.id === runnerId ? { ...slot, ...patch } : slot,
              ),
            }
          : line,
      ),
    );
  }

  function copiedBuyer() {
    return {
      name: filterNoSpaceName(buyerName),
      phone,
      birth: buyerBirth,
      gender: buyerGender,
    };
  }

  function setAllSame(sameAs: boolean) {
    const copied = copiedBuyer();
    setLines((prev) =>
      prev.map((line) => ({
        ...line,
        runners: line.runners.map((slot) => ({
          ...slot,
          sameAs,
          ...(sameAs ? copied : {}),
        })),
      })),
    );
  }

  async function onPay(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!lines.length) {
      setError("패키지를 하나 이상 담아 주세요.");
      return;
    }
    const buyerIssue = personIssue("신청자", buyer);
    if (buyerIssue) {
      setError(buyerIssue);
      return;
    }
    const runnerIssue = resolved
      .flatMap((line) =>
        line.runners
          .filter((slot) => !slot.sameAs)
          .map((slot) =>
            personIssue(
              line.runners.length > 1 ? `${line.pkg.name} ${slot.theme}` : line.pkg.name,
              slot,
            ),
          ),
      )
      .find(Boolean);
    if (runnerIssue) {
      setError(runnerIssue);
      return;
    }
    if ((options.addressRequired || !virtualRunDemoEnabled) && !addr.address.trim()) {
      setError("배송 주소를 입력해 주세요.");
      return;
    }
    if (!hasTossClientKey) {
      setError("결제 연동 설정(NEXT_PUBLIC_TOSS_CLIENT_KEY)이 필요합니다. env 변경 후 dev 서버를 재시작하세요.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const body = toVirtualRunItemsRequest({
        lines: resolved.map((line) => {
          const category = virtualRunProductForPackage(options.categories, line.packageId);
          if (!category) throw new Error(`${line.pkg.name} 상품을 찾지 못했습니다.`);
          return {
            category,
            recipients: line.runners.map((slot) => {
              const child = virtualRunEntryCategory(options.categories, category, slot.themeId);
              if (!child) {
                throw new Error(`${line.pkg.name} ${slot.theme} 종목을 찾지 못했습니다.`);
              }
              return {
                eventCategoryId: child.categoryId,
                name: slot.runnerName,
                phone: slot.runnerPhone,
                birth: slot.runnerBirth,
                gender: slot.runnerGender,
              };
            }),
          };
        }),
        buyer: {
          name: buyerName,
          phone,
          birth: buyerBirth,
          gender: buyerGender,
          password,
          zonecode: addr.zonecode,
          address: addr.address,
          addressDetail: addr.addressDetail,
          guardianName: "",
          guardianPhone: "",
          guardianRelation: "",
          guardianConsent: false,
        },
        addressRequired: options.addressRequired,
        consents,
      });
      const created = await submitVirtualRunRegistration(VIRTUAL_RUN_EVENT_ID, body);
      const customerName = filterNoSpaceName(buyerName);
      const registration: PaymentOrder = {
        orderId: created.orderId,
        orderName: created.orderName || vrPackageOrderName(lines),
        paymentAmount: created.paymentAmount,
      };
      saveVirtualRunTicketPending({
        registration,
        customerName,
        phone: phoneDigits(phone),
        kind: vrPackageTicketKind(lines),
        roundIds: vrPackageRoundIds(lines),
        savedAt: Date.now(),
      });
      if (isMobileView()) {
        router.push(toHref("/payment"));
        return;
      }
      setPayOrder(registration);
      setPayName(customerName);
      setPayOpen(true);
    } catch (err) {
      setError(
        err instanceof MainHttpError && err.code === "REGISTRATION_ADDITIONAL_ORDER_LOGIN_REQUIRED"
          ? "이미 신청한 내역이 있습니다. 로그인한 뒤 추가 주문해 주세요."
          : err instanceof MainHttpError || err instanceof Error
            ? err.message
            : "신청에 실패했습니다.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (options.loading) {
    return <p className="form__note">신청 옵션을 불러오는 중...</p>;
  }

  if (!options.registrationOpen) {
    return (
      <>
        <RegistrationPolicyNotice reason={options.registrationReason} />
        <div className="flow__nav">
          <button type="button" className="btn btn--ghost" onClick={onBack}>
            이전
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <form className="form" onSubmit={onPay} noValidate>
        <section className="block">
          <header className="form__head">
            <h2>패키지 선택</h2>
            <p className="form__note">
              싱글패키지는 테마 1종 {won(VR_SINGLE_PACKAGES[0].price)}, 어셈블 패키지는 세 테마{" "}
              {won(VR_ASSEMBLE_PACKAGE.price)}입니다. 여러 패키지를 함께 담을 수 있습니다.
            </p>
          </header>
          <div className="vr-pkg">
            <section className="vr-pkg__group" aria-labelledby="vr-pkg-single">
              <header className="vr-pkg__head">
                <h3 id="vr-pkg-single">싱글패키지</h3>
                <p>각 {won(VR_SINGLE_PACKAGES[0].price)}</p>
              </header>
              <ul className="vr-pkg__singles">
                {VR_SINGLE_PACKAGES.map((item) => (
                  <li key={item.id}>
                    <PackageCard
                      item={item}
                      count={countOf(lines, item.id)}
                      onChange={(delta) => setQty(item.id, delta)}
                    />
                  </li>
                ))}
              </ul>
            </section>
            <section className="vr-pkg__group" aria-labelledby="vr-pkg-assemble">
              <header className="vr-pkg__head">
                <h3 id="vr-pkg-assemble">3종 할인패키지</h3>
                <p>{won(VR_ASSEMBLE_PACKAGE.price)}</p>
              </header>
              <PackageCard
                item={VR_ASSEMBLE_PACKAGE}
                count={countOf(lines, VR_ASSEMBLE_PACKAGE.id)}
                onChange={(delta) => setQty(VR_ASSEMBLE_PACKAGE.id, delta)}
              />
            </section>
          </div>
          {overlapNote ? <p className="vr-pkg__hint">{overlapNote}</p> : null}
        </section>

        <FormSec kicker="01 / SHIPPING" title="신청자 · 배송">
          <FormRow label="신청자 이름" required>
            <input
              type="text"
              value={buyerName}
              maxLength={50}
              onChange={(e) => setBuyerName(filterNoSpaceName(e.target.value))}
              autoComplete="name"
            />
          </FormRow>
          <FormRow label="생년월일" required>
            <BirthPick value={buyerBirth} onChange={setBuyerBirth} />
          </FormRow>
          <FormRow label="휴대폰 번호" required>
            <PhoneField value={phone} onChange={setPhone} autoComplete="tel" placeholder="010-0000-0000" />
            <p className="form-row__hint">배송 안내를 이 번호로 보냅니다.</p>
          </FormRow>
          <FormRow label="성별" required>
            <GenderPick name="buyer-gender" value={buyerGender} onChange={setBuyerGender} />
          </FormRow>
          <FormRow label="신청 비밀번호" required>
            <PasswordField value={password} onChange={setPassword} required />
          </FormRow>
          <FormRow label="배송 주소" required>
            <AddressField
              zonecode={addr.zonecode}
              address={addr.address}
              addressDetail={addr.addressDetail}
              onChange={(patch) => setAddr((prev) => ({ ...prev, ...patch }))}
            />
          </FormRow>
        </FormSec>

        <FormSec
          kicker="02 / RUNNER"
          title="패키지별 참가자"
          note="신청자와 같으면 체크합니다. 어셈블 패키지는 테마마다 참가자를 입력합니다. 배번호는 정보 수정 기간 이후에 부여됩니다."
        >
          {runnerCount > 1 ? (
            <div className="vr-recipients__all">
              <label className={`vr-recipients__same${allSame ? " is-on" : ""}`}>
                <input
                  type="checkbox"
                  checked={allSame}
                  onChange={(e) => setAllSame(e.target.checked)}
                />
                모두 신청자와 동일
              </label>
            </div>
          ) : null}
          {lines.length ? (
            <ul className="vr-pkg-lines">
              {resolved.map((line, index) => (
                <li key={line.id} className={`is-${line.pkg.accent}`}>
                  <img src={line.pkg.image} alt="" width={72} height={72} />
                  <div className="vr-pkg-lines__body">
                    <div className="vr-pkg-lines__head">
                      <strong>
                        {index + 1}. {line.pkg.name}
                      </strong>
                    </div>
                    <div className={line.runners.length > 1 ? "vr-pkg-lines__themes" : undefined}>
                      {line.runners.map((slot) => (
                        <div
                          key={slot.id}
                          className={`vr-pkg-lines__theme is-${virtualRunRoundById(slot.themeId).accent}`}
                        >
                          {line.runners.length > 1 ? <strong>{slot.theme}</strong> : null}
                          <label className={`vr-recipients__same${slot.sameAs ? " is-on" : ""}`}>
                            <input
                              type="checkbox"
                              checked={slot.sameAs}
                              onChange={(e) => {
                                const sameAs = e.target.checked;
                                patchRunner(line.id, slot.id, {
                                  sameAs,
                                  ...(sameAs ? copiedBuyer() : {}),
                                });
                              }}
                            />
                            신청자와 동일
                          </label>
                          {slot.sameAs ? (
                            <p className="vr-pkg-lines__same">
                              {slot.runnerName || "신청자"}
                              {" · "}
                              {birthLabel(slot.runnerBirth) || "생년월일"}
                              {" · "}
                              {genderLabel(slot.runnerGender) || "성별"}
                              {" · "}
                              {formatPhone(slot.runnerPhone) || "휴대폰"}
                            </p>
                          ) : (
                            <>
                              <FormRow label="이름" required>
                                <input
                                  type="text"
                                  value={slot.name}
                                  maxLength={50}
                                  onChange={(e) =>
                                    patchRunner(line.id, slot.id, {
                                      name: filterNoSpaceName(e.target.value),
                                    })
                                  }
                                  placeholder="참가 이름"
                                />
                              </FormRow>
                              <FormRow label="생년월일" required>
                                <BirthPick
                                  value={slot.birth}
                                  onChange={(birth) => patchRunner(line.id, slot.id, { birth })}
                                />
                              </FormRow>
                              <FormRow label="휴대폰 번호" required>
                                <PhoneField
                                  value={slot.phone}
                                  onChange={(next) => patchRunner(line.id, slot.id, { phone: next })}
                                  placeholder="010-0000-0000"
                                />
                              </FormRow>
                              <FormRow label="성별" required>
                                <GenderPick
                                  name={`gender-${slot.id}`}
                                  value={slot.gender}
                                  onChange={(gender) => patchRunner(line.id, slot.id, { gender })}
                                />
                              </FormRow>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="form__note">패키지를 담으면 참가자 칸이 생깁니다.</p>
          )}
        </FormSec>

        <section className="vr-sum" aria-label="결제 요약">
          {resolved.length ? (
            <dl>
              {resolved.map((line) => (
                <div key={line.id}>
                  <dt>{line.pkg.name}</dt>
                  <dd>
                    {line.runners
                      .map((slot) => slot.runnerName || (line.runners.length > 1 ? slot.theme : "이름 미입력"))
                      .join(" · ")}{" "}
                    · {won(line.pkg.price)}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="form__note">담은 패키지가 없습니다.</p>
          )}
          <p className="vr-sum__total">
            <span>결제 금액</span>
            <strong>{won(total)}</strong>
          </p>
        </section>

        {error ? (
          <p className="form__err" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flow__nav">
          <button type="button" className="btn btn--ghost" onClick={onBack}>
            이전
          </button>
          <button type="submit" className="btn btn--red" disabled={submitting || !lines.length}>
            {submitting ? "신청 중..." : `${won(total)} 결제하기`}
          </button>
        </div>
      </form>

      {payOpen && payOrder ? (
        <SheetModal kicker="PAY" title="결제하기" onClose={() => setPayOpen(false)}>
          <PaymentWidget
            registration={payOrder}
            customerName={payName}
            successPath={toHref("/payment/success")}
            failPath={toHref("/payment/fail")}
            onError={setError}
          />
        </SheetModal>
      ) : null}
    </>
  );
}

function PackageCard({
  item,
  count,
  onChange,
}: {
  item: VrPackage;
  count: number;
  onChange: (delta: number) => void;
}) {
  return (
    <article className={`vr-pkg__card is-${item.accent}${count ? " is-on" : ""}`}>
      <img src={item.image} alt="" />
      <strong>{item.name}</strong>
      <div className="vr-pkg__qty" aria-label={`${item.name} 수량`}>
        <button
          type="button"
          aria-label={`${item.name} 하나 빼기`}
          disabled={!count}
          onClick={() => onChange(-1)}
        >
          −
        </button>
        <span>{count}</span>
        <button
          type="button"
          aria-label={`${item.name} 하나 담기`}
          disabled={count >= ITEM_LIMIT}
          onClick={() => onChange(1)}
        >
          +
        </button>
      </div>
    </article>
  );
}
