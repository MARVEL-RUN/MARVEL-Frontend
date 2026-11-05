"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PaymentWidget } from "@/components/main/payment/PaymentWidget";
import { AddressField, FormRow, FormSec, PhoneField } from "@/components/main/register/ApplyUi";
import { SheetModal } from "@/components/main/SheetModal";
import { hasTossClientKey } from "@/lib/main/config";
import type { PaymentOrder } from "@/lib/payment/session";
import { filterNoSpaceName } from "@/lib/register";
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
import { virtualRunDemoEnabled } from "@/lib/virtual-run/site";
import {
  createVirtualRunOrderId,
  saveVirtualRunTicketPending,
} from "@/lib/virtual-run/ticket-payment";
import { useVrPath, VrLink } from "../layout/VrLink";

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const QTY_CAP = 20;

type PackageLine = {
  id: string;
  packageId: VrPackageId;
  name: string;
  phone: string;
  sameAs: boolean;
};

const phoneDigits = (value: string) => value.replace(/\D/g, "");

function countOf(lines: PackageLine[], packageId: VrPackageId) {
  return lines.filter((line) => line.packageId === packageId).length;
}

export function VirtualRunPackageForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const toHref = useVrPath();
  const [lines, setLines] = useState<PackageLine[]>([]);
  const [buyerName, setBuyerName] = useState("");
  const [phone, setPhone] = useState("");
  const [addr, setAddr] = useState({ zonecode: "", address: "", addressDetail: "" });
  const [error, setError] = useState("");
  const [payOpen, setPayOpen] = useState(false);
  const [payOrder, setPayOrder] = useState<PaymentOrder | null>(null);
  const [payName, setPayName] = useState("");

  const total = vrPackageTotal(lines);
  const overlapNote = vrSingleOverlapNote(lines);
  const allSame = lines.length > 0 && lines.every((line) => line.sameAs);

  const resolved = useMemo(
    () =>
      lines.map((line) => ({
        ...line,
        runnerName: line.sameAs ? filterNoSpaceName(buyerName) : filterNoSpaceName(line.name),
        runnerPhone: line.sameAs ? phoneDigits(phone) : phoneDigits(line.phone),
        pkg: vrPackageById(line.packageId),
      })),
    [buyerName, lines, phone],
  );

  function setQty(packageId: VrPackageId, delta: number) {
    setLines((prev) => {
      const ofType = prev.filter((line) => line.packageId === packageId);
      if (delta > 0) {
        if (ofType.length >= QTY_CAP) return prev;
        return [
          ...prev,
          { id: crypto.randomUUID(), packageId, name: "", phone: "", sameAs: false },
        ];
      }
      if (!ofType.length) return prev;
      const empty = [...ofType]
        .reverse()
        .find((line) => !line.name.trim() && !line.phone.trim() && !line.sameAs);
      const target = empty ?? ofType[ofType.length - 1];
      return prev.filter((line) => line.id !== target.id);
    });
  }

  function patchLine(id: string, patch: Partial<PackageLine>) {
    setLines((prev) => prev.map((line) => (line.id === id ? { ...line, ...patch } : line)));
  }

  function setAllSame(sameAs: boolean) {
    setLines((prev) =>
      prev.map((line) => ({
        ...line,
        sameAs,
        ...(sameAs ? { name: filterNoSpaceName(buyerName), phone } : {}),
      })),
    );
  }

  function onPay(e: FormEvent) {
    e.preventDefault();
    if (!lines.length) {
      setError("패키지를 하나 이상 담아 주세요.");
      return;
    }
    const missingName = resolved.find((line) => !line.sameAs && !line.runnerName);
    if (missingName) {
      setError(`${missingName.pkg.name} 이름을 입력해 주세요.`);
      return;
    }
    const missingPhone = resolved.find((line) => !line.sameAs && line.runnerPhone.length < 10);
    if (missingPhone) {
      setError(`${missingPhone.pkg.name} 휴대폰 번호를 확인해 주세요.`);
      return;
    }
    const digits = phoneDigits(phone);
    const contactOk = buyerName.trim() && digits.length >= 10 && addr.address;
    if (!contactOk && !virtualRunDemoEnabled) {
      setError(
        !buyerName.trim()
          ? "신청자 이름을 입력해 주세요."
          : digits.length < 10
            ? "휴대폰 번호를 확인해 주세요."
            : "배송 주소를 입력해 주세요.",
      );
      return;
    }
    if (!hasTossClientKey) {
      setError("결제 연동 설정(NEXT_PUBLIC_TOSS_CLIENT_KEY)이 필요합니다. env 변경 후 dev 서버를 재시작하세요.");
      return;
    }

    setError("");
    const customerName = filterNoSpaceName(buyerName) || resolved[0]?.runnerName || "참가자";
    const registration: PaymentOrder = {
      orderId: createVirtualRunOrderId(),
      orderName: vrPackageOrderName(lines),
      paymentAmount: total,
    };
    saveVirtualRunTicketPending({
      registration,
      customerName,
      phone: digits.length >= 10 ? digits : "01000000000",
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
              onChange={(e) => setBuyerName(filterNoSpaceName(e.target.value))}
              autoComplete="name"
            />
          </FormRow>
          <FormRow label="휴대폰 번호" required>
            <PhoneField value={phone} onChange={setPhone} autoComplete="tel" placeholder="010-0000-0000" />
            <p className="form-row__hint">배송 안내를 이 번호로 보냅니다.</p>
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
          note="신청자와 같으면 체크합니다. 다른 사람은 이름과 휴대폰 번호를 입력합니다. 배번호는 정보 수정 기간 이후에 부여됩니다."
        >
          {lines.length > 1 ? (
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
                    <label className={`vr-recipients__same${line.sameAs ? " is-on" : ""}`}>
                      <input
                        type="checkbox"
                        checked={line.sameAs}
                        onChange={(e) => {
                          const sameAs = e.target.checked;
                          patchLine(line.id, {
                            sameAs,
                            ...(sameAs
                              ? { name: filterNoSpaceName(buyerName), phone }
                              : {}),
                          });
                        }}
                      />
                      신청자와 동일
                    </label>
                    {line.sameAs ? (
                      <p className="vr-pkg-lines__same">
                        {filterNoSpaceName(buyerName) || "신청자"} · {phone || "신청자 휴대폰"}
                      </p>
                    ) : (
                      <>
                        <FormRow label="이름" required>
                          <input
                            type="text"
                            value={line.name}
                            onChange={(e) =>
                              patchLine(line.id, { name: filterNoSpaceName(e.target.value) })
                            }
                            placeholder="참가 이름"
                          />
                        </FormRow>
                        <FormRow label="휴대폰 번호" required>
                          <PhoneField
                            value={line.phone}
                            onChange={(next) => patchLine(line.id, { phone: next })}
                            placeholder="010-0000-0000"
                          />
                        </FormRow>
                      </>
                    )}
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
                    {line.runnerName || "이름 미입력"} · {won(line.pkg.price)}
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
          <button type="submit" className="btn btn--red" disabled={!lines.length}>
            {won(total)} 결제하기
          </button>
        </div>
      </form>

      <div className="lookup-other">
        <VrLink href="/login" className="lookup-other__btn">
          이미 티켓이 있으신가요
        </VrLink>
      </div>

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
          disabled={count >= QTY_CAP}
          onClick={() => onChange(1)}
        >
          +
        </button>
      </div>
    </article>
  );
}
