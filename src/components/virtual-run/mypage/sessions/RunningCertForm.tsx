"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { FormRow, FormSec } from "@/components/main/register/ApplyUi";
import { demoInstantApproveRunning } from "@/lib/virtual-run/cert-demo";
import { virtualRunDemoEnabled } from "@/lib/virtual-run/site";
import { roundStatusForParticipant } from "@/lib/virtual-run/participant";
import type { VirtualRunRoundId } from "@/lib/virtual-run/rounds";
import { VIRTUAL_RUN_ROUNDS, virtualRunRoundById } from "@/lib/virtual-run/rounds";
import {
  RUNNING_CERT_HASHTAGS,
  RUNNING_CERT_MIN_KM,
  RUNNING_CERT_PERIOD,
  RUNNING_CERT_PERIOD_LABEL,
  RUNNING_RECORD_TOOLS,
  formatPaceMinPerKm,
  isInstagramPostUrl,
  isWithinCertPeriod,
  parseDistanceKm,
  parseDurationParts,
  runningCertDateMax,
  type RunningRecordToolId,
} from "@/lib/virtual-run/running-cert";
import { VrLink } from "../../layout/VrLink";
import { useVirtualRunParticipantOrDemo } from "../../participant/VirtualRunParticipantProvider";
import { CertSubmitResult } from "../CertSubmitResult";
import { HashtagCopy } from "../HashtagCopy";
import { VrFileField } from "../VrFileField";
import { VrSteps } from "../VrSteps";

type FieldErrors = Partial<Record<string, string>>;
type Step = 1 | 2 | 3;

const STEP_LABELS = ["러닝 기록", "증빙 사진", "인스타 인증"] as const;

function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="form-row__hint is-err" role="alert">
      {msg}
    </p>
  );
}

export function RunningCertForm() {
  const { participant, update } = useVirtualRunParticipantOrDemo();
  const formRef = useRef<HTMLFormElement>(null);

  const openRounds = VIRTUAL_RUN_ROUNDS.filter((r) => {
    const st = roundStatusForParticipant(participant, r.id);
    return st === "ready" || st === "rejected";
  });

  const dateMax = runningCertDateMax();
  const [step, setStep] = useState<Step>(1);
  const [roundId, setRoundId] = useState<VirtualRunRoundId | "">(openRounds[0]?.id ?? "");
  const [runDate, setRunDate] = useState("");
  const [distance, setDistance] = useState("");
  const [durH, setDurH] = useState("0");
  const [durM, setDurM] = useState("");
  const [durS, setDurS] = useState("");
  const [tool, setTool] = useState<RunningRecordToolId | "">("");
  const [instaUrl, setInstaUrl] = useState("");
  const [promoOk, setPromoOk] = useState(false);
  const [pledgeOk, setPledgeOk] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [result, setResult] = useState<{
    mode: "approved" | "pending";
    rows: { label: string; value: string }[];
  } | null>(null);

  const activeRound = openRounds.some((r) => r.id === roundId) ? roundId : (openRounds[0]?.id ?? "");
  const rejected = activeRound ? participant.rounds[activeRound] : undefined;

  const totalSeconds = useMemo(() => parseDurationParts(durH, durM, durS), [durH, durM, durS]);
  const distanceKm = useMemo(() => parseDistanceKm(distance), [distance]);
  const pace = useMemo(() => {
    if (totalSeconds == null || distanceKm == null) return null;
    return formatPaceMinPerKm(totalSeconds, distanceKm);
  }, [totalSeconds, distanceKm]);

  const step1Ok =
    Boolean(activeRound) &&
    Boolean(runDate) &&
    isWithinCertPeriod(runDate) &&
    distanceKm != null &&
    distanceKm >= RUNNING_CERT_MIN_KM &&
    totalSeconds != null &&
    Boolean(tool);

  function validateRecord(): FieldErrors {
    const next: FieldErrors = {};
    if (!runDate) next.runDate = "달린 날짜를 선택해 주세요.";
    else if (!isWithinCertPeriod(runDate)) {
      next.runDate = `${RUNNING_CERT_PERIOD_LABEL} 사이 날짜만 선택할 수 있습니다.`;
    }
    if (distanceKm == null) next.distance = "거리를 입력해 주세요.";
    else if (distanceKm < RUNNING_CERT_MIN_KM) {
      next.distance = `${RUNNING_CERT_MIN_KM.toFixed(2)}km 이상부터 인증할 수 있습니다.`;
    }
    if (totalSeconds == null) next.duration = "기록 시간을 입력해 주세요.";
    if (!tool) next.tool = "기록 도구를 선택해 주세요.";
    return next;
  }

  function move(to: Step, check?: () => FieldErrors) {
    const next = check?.() ?? {};
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setStep(to);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function validatePhotos(): FieldErrors {
    const fd = new FormData(formRef.current!);
    const file = fd.get("recordShot");
    return file instanceof File && file.size > 0 ? {} : { recordShot: "기록 스크린샷을 첨부해 주세요." };
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!activeRound) return;
    const fd = new FormData(e.currentTarget);
    const next: FieldErrors = {};
    const shot = fd.get("instaShot");
    if (!(shot instanceof File && shot.size > 0)) next.instaShot = "게시물 스크린샷을 첨부해 주세요.";
    if (!instaUrl.trim()) next.instaUrl = "게시물 링크를 입력해 주세요.";
    else if (!isInstagramPostUrl(instaUrl)) {
      next.instaUrl = "instagram.com/p/ 또는 /reel/ 로 시작하는 주소를 넣어 주세요.";
    }
    if (!pledgeOk) next.pledge = "허위 제출 서약에 동의해 주세요.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const summary = {
      runDate,
      distanceKm: distanceKm!,
      durationLabel: `${Number(durH) || 0}:${durM.padStart(2, "0")}:${(durS || "0").padStart(2, "0")}`,
      paceLabel: pace,
    };
    const round = virtualRunRoundById(activeRound);
    const rows = [
      { label: "회차", value: `${round.label} · ${round.theme}` },
      { label: "달린 날짜", value: summary.runDate },
      { label: "거리", value: `${summary.distanceKm.toFixed(2)}km` },
      { label: "기록", value: summary.durationLabel },
      ...(pace ? [{ label: "평균 페이스", value: pace }] : []),
    ];
    if (virtualRunDemoEnabled) {
      update(demoInstantApproveRunning(participant, activeRound, summary));
      setResult({ mode: "approved", rows });
    } else {
      const prev = participant.rounds[activeRound];
      update({
        ...participant,
        rounds: {
          ...participant.rounds,
          [activeRound]: {
            status: "pending",
            resubmitCount: (prev?.resubmitCount ?? 0) + (prev?.status === "rejected" ? 1 : 0),
            summary,
          },
        },
      });
      setResult({ mode: "pending", rows });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setResult(null);
    setStep(1);
    setRoundId("");
    setRunDate("");
    setDistance("");
    setDurH("0");
    setDurM("");
    setDurS("");
    setTool("");
    setInstaUrl("");
    setPromoOk(false);
    setPledgeOk(false);
    setErrors({});
  }

  if (result) {
    return (
      <CertSubmitResult
        mode={result.mode}
        subject="러닝 인증"
        rows={result.rows}
        approvedNote="완주 기프티콘을 등록된 휴대폰 번호로 보냈습니다."
        onAgain={openRounds.length > 0 ? reset : undefined}
        againLabel="다른 회차 인증"
      />
    );
  }

  if (openRounds.length === 0) {
    const owned = participant.ownedRoundIds.length > 0;
    return (
      <section className="block wait">
        <span className="kicker">{owned ? "ALL SUBMITTED" : "NO TICKET"}</span>
        <h2>{owned ? "모든 회차를 제출했습니다" : "인증할 회차가 없습니다"}</h2>
        <p className="sec__body">
          {owned
            ? "검수 중인 회차는 결과가 나오면 문자로 알려 드립니다."
            : "티켓을 구매하면 해당 회차의 러닝 인증을 할 수 있습니다."}
        </p>
        <div className="flow__nav">
          <VrLink href={owned ? "/mypage" : "/tickets"} className="btn btn--red">
            {owned ? "마이페이지" : "티켓 구매"}
          </VrLink>
        </div>
      </section>
    );
  }

  return (
    <form ref={formRef} className="form vr-cert-form" onSubmit={onSubmit} noValidate>
      <VrSteps labels={STEP_LABELS} current={step} />

      <div hidden={step !== 1}>
        <FormSec kicker="01 / RUN" title="러닝 기록" note="기록 화면에 보이는 값 그대로 입력해 주세요.">
          <FormRow label="회차" required>
            <div className="seg vr-round-seg" role="radiogroup" aria-label="회차">
              {openRounds.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  role="radio"
                  aria-checked={activeRound === r.id}
                  className={`is-${r.accent}${activeRound === r.id ? " is-on" : ""}`}
                  onClick={() => setRoundId(r.id)}
                >
                  {r.label} · {r.theme}
                </button>
              ))}
            </div>
            {rejected?.status === "rejected" ? (
              <p className="form-row__hint is-err">
                반려{rejected.rejectReason ? ` · ${rejected.rejectReason}` : ""} (재제출 {rejected.resubmitCount}/2)
              </p>
            ) : (
              <p className="form-row__hint">구매한 회차 중 아직 인증하지 않은 회차만 보입니다.</p>
            )}
          </FormRow>

          <FormRow label="달린 날짜" required>
            <input
              type="date"
              name="runDate"
              value={runDate}
              min={RUNNING_CERT_PERIOD.start}
              max={dateMax}
              onChange={(e) => setRunDate(e.target.value)}
              aria-invalid={Boolean(errors.runDate)}
            />
            {errors.runDate ? (
              <Err msg={errors.runDate} />
            ) : (
              <p className="form-row__hint">{RUNNING_CERT_PERIOD_LABEL} · 오늘 이후 날짜는 선택할 수 없습니다.</p>
            )}
          </FormRow>

          <FormRow label="거리" required>
            <div className="vr-unit">
              <input
                type="text"
                name="distance"
                inputMode="decimal"
                placeholder="5.00"
                value={distance}
                onChange={(e) => setDistance(e.target.value.replace(/[^\d.,]/g, ""))}
                aria-invalid={Boolean(errors.distance)}
              />
              <span>km</span>
            </div>
            <Err msg={errors.distance} />
          </FormRow>

          <FormRow label="기록 시간" required>
            <div className="vr-duration">
              {(
                [
                  ["시", durH, setDurH, 2],
                  ["분", durM, setDurM, 2],
                  ["초", durS, setDurS, 2],
                ] as const
              ).map(([unit, value, set, max], i) => (
                <span key={unit} className="vr-duration__part">
                  {i > 0 ? <span className="vr-duration__sep">:</span> : null}
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={max}
                    placeholder="00"
                    value={value}
                    onChange={(e) => set(e.target.value.replace(/\D/g, ""))}
                    aria-label={unit}
                  />
                  <small>{unit}</small>
                </span>
              ))}
            </div>
            {errors.duration ? (
              <Err msg={errors.duration} />
            ) : pace ? (
              <p className="form-row__hint is-ok">평균 페이스 {pace}</p>
            ) : (
              <p className="form-row__hint">거리와 시간을 넣으면 페이스가 계산됩니다.</p>
            )}
          </FormRow>

          <FormRow label="기록 도구" required>
            <div className="seg" role="radiogroup" aria-label="기록 도구">
              {RUNNING_RECORD_TOOLS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={tool === item.id}
                  className={tool === item.id ? "is-on" : undefined}
                  onClick={() => setTool(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <Err msg={errors.tool} />
          </FormRow>
        </FormSec>

        <div className="flow__nav">
          <button type="button" className="btn btn--red" disabled={!step1Ok} onClick={() => move(2, validateRecord)}>
            다음
          </button>
          {!step1Ok ? (
            <p className="flow__err form__note">{RUNNING_CERT_MIN_KM}km 이상 기록과 필수 항목을 모두 입력해 주세요.</p>
          ) : null}
        </div>
      </div>

      <div hidden={step !== 2}>
        <FormSec kicker="02 / PROOF" title="증빙 사진">
          <VrFileField
            name="recordShot"
            label="기록 스크린샷"
            required
            hint="거리·시간·날짜가 한 화면에 보여야 합니다. 트레드밀은 계기판 사진."
            error={errors.recordShot}
          />
          <VrFileField name="proofShot" label="인증샷" hint="배번호나 피니시 라인이 보이면 좋습니다." />
        </FormSec>
        <div className="flow__nav">
          <button type="button" className="btn btn--ghost" onClick={() => move(1)}>
            이전
          </button>
          <button type="button" className="btn btn--red" onClick={() => move(3, validatePhotos)}>
            다음
          </button>
        </div>
      </div>

      <div hidden={step !== 3}>
        <FormSec kicker="03 / INSTAGRAM" title="인스타 인증" note="기록 화면과 인증샷을 아래 해시태그와 함께 게시해 주세요.">
          <HashtagCopy tags={RUNNING_CERT_HASHTAGS} />
          <VrFileField
            name="instaShot"
            label="게시물 스크린샷"
            required
            hint="해시태그가 보이는 화면"
            error={errors.instaShot}
          />
          <FormRow label="게시물 링크" required>
            <input
              type="text"
              inputMode="url"
              name="instaUrl"
              className="is-wide"
              placeholder="https://www.instagram.com/p/..."
              value={instaUrl}
              onChange={(e) => setInstaUrl(e.target.value)}
              aria-invalid={Boolean(errors.instaUrl)}
            />
            <Err msg={errors.instaUrl} />
          </FormRow>
          <div className="vr-agree">
            <label className="guardian-consent-check">
              <input type="checkbox" checked={pledgeOk} onChange={(e) => setPledgeOk(e.target.checked)} />
              <span className="guardian-consent-check__label">
                <em>[필수]</em> 허위 제출이 확인되면 리워드 회수에 동의합니다.
              </span>
            </label>
            <label className="guardian-consent-check">
              <input type="checkbox" checked={promoOk} onChange={(e) => setPromoOk(e.target.checked)} />
              <span className="guardian-consent-check__label">
                <em className="is-opt">[선택]</em> 공식 채널 리그램 등 홍보 활용에 동의합니다.
              </span>
            </label>
            <Err msg={errors.pledge} />
          </div>
        </FormSec>
        <div className="flow__nav">
          <button type="button" className="btn btn--ghost" onClick={() => move(2)}>
            이전
          </button>
          <button type="submit" className="btn btn--red">
            제출하기
          </button>
        </div>
      </div>
    </form>
  );
}
