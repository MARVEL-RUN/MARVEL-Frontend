"use client";

import { FormEvent, useMemo, useState } from "react";
import { FormRow, FormSec } from "@/components/main/register/ApplyUi";
import {
  DEMO_SESSION_ROUNDS,
  RUNNING_CERT_HASHTAGS,
  RUNNING_CERT_MIN_KM,
  RUNNING_CERT_PERIOD,
  RUNNING_RECORD_TOOLS,
  formatPaceMinPerKm,
  isInstagramPostUrl,
  isWithinCertPeriod,
  parseDistanceKm,
  parseDurationParts,
  runningCertDateMax,
  type RunningRecordToolId,
} from "@/lib/virtual-run/running-cert";
import { VrFileField } from "./VrFileField";

type FieldErrors = Partial<Record<string, string>>;

export function RunningCertForm() {
  const openRounds = DEMO_SESSION_ROUNDS.filter((r) => !r.certified);
  const dateMax = runningCertDateMax();
  const [roundId, setRoundId] = useState(openRounds[0]?.id ?? "");
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
  const [submitted, setSubmitted] = useState(false);

  const totalSeconds = useMemo(
    () => parseDurationParts(durH, durM, durS),
    [durH, durM, durS],
  );
  const distanceKm = useMemo(() => parseDistanceKm(distance), [distance]);
  const pace = useMemo(() => {
    if (totalSeconds == null || distanceKm == null) return null;
    return formatPaceMinPerKm(totalSeconds, distanceKm);
  }, [totalSeconds, distanceKm, distance]);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!roundId) next.roundId = "인증 가능한 회차가 없습니다.";
    if (!runDate) next.runDate = "달린 날짜를 선택해 주세요.";
    else if (!isWithinCertPeriod(runDate)) {
      next.runDate = `인증 기간(${RUNNING_CERT_PERIOD.start} ~ ${RUNNING_CERT_PERIOD.end}) 내 날짜만 가능합니다.`;
    }
    const km = parseDistanceKm(distance);
    if (km == null) next.distance = "거리를 입력해 주세요.";
    else if (km < RUNNING_CERT_MIN_KM) {
      next.distance = `최소 ${RUNNING_CERT_MIN_KM.toFixed(2)}km 이상이어야 합니다.`;
    }
    if (totalSeconds == null) next.duration = "기록 시간을 입력해 주세요.";
    if (!tool) next.tool = "기록 도구를 선택해 주세요.";
    if (!instaUrl.trim()) next.instaUrl = "인스타 게시물 링크를 입력해 주세요.";
    else if (!isInstagramPostUrl(instaUrl)) {
      next.instaUrl = "instagram.com/p/ 또는 /reel/ 형식의 URL이어야 합니다.";
    }
    if (!pledgeOk) next.pledge = "허위 제출 서약에 동의해 주세요.";
    return next;
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const next = validate();
    if (!fd.get("recordShot")) next.recordShot = "기록 스크린샷을 첨부해 주세요.";
    if (!fd.get("instaShot")) next.instaShot = "인스타 게시물 스크린샷을 첨부해 주세요.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSubmitted(true);
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (openRounds.length === 0) {
    return (
      <article className="vr-panel vr-cert-empty">
        <p>인증 가능한 회차가 없습니다. 티켓 구매 후 다시 확인해 주세요.</p>
      </article>
    );
  }

  if (submitted) {
    return (
      <article className="vr-panel vr-cert-done">
        <h2>제출 완료 (UI)</h2>
        <p>API 연동 후 심사·리워드 상태가 회차 카드에 표시됩니다.</p>
        <button type="button" className="btn btn--ghost vr-stack-sm" onClick={() => setSubmitted(false)}>
          다른 회차 인증하기
        </button>
      </article>
    );
  }

  return (
    <form className="form vr-cert-form" onSubmit={onSubmit} noValidate>
      <FormSec kicker="01 / RUN" title="러닝 기록" note="회차당 1회만 승인됩니다.">
        <FormRow label="회차" required>
          <select
            name="roundId"
            value={roundId}
            onChange={(e) => setRoundId(e.target.value)}
            aria-invalid={Boolean(errors.roundId)}
          >
            {openRounds.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label} · {r.theme}
              </option>
            ))}
          </select>
          {errors.roundId ? (
            <p className="form-row__hint is-err" role="alert">
              {errors.roundId}
            </p>
          ) : (
            <p className="form-row__hint">구매·미인증 회차만 표시됩니다.</p>
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
            <p className="form-row__hint is-err" role="alert">
              {errors.runDate}
            </p>
          ) : (
            <p className="form-row__hint">미래 날짜는 선택할 수 없습니다.</p>
          )}
        </FormRow>

        <div className="vr-cert-form__grid">
          <FormRow label="거리 (km)" required>
            <input
              type="number"
              name="distance"
              inputMode="decimal"
              step="0.01"
              min={RUNNING_CERT_MIN_KM}
              placeholder="5.00"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              aria-invalid={Boolean(errors.distance)}
            />
            {errors.distance ? (
              <p className="form-row__hint is-err" role="alert">
                {errors.distance}
              </p>
            ) : null}
          </FormRow>

          <FormRow label="기록 시간" required>
            <div className="vr-cert-form__duration">
              <label className="vr-cert-form__dur-part">
                <span className="vr-form-note">시</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={23}
                  value={durH}
                  onChange={(e) => setDurH(e.target.value)}
                  aria-label="시"
                />
              </label>
              <span className="vr-cert-form__dur-sep">:</span>
              <label className="vr-cert-form__dur-part">
                <span className="vr-form-note">분</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={59}
                  value={durM}
                  onChange={(e) => setDurM(e.target.value)}
                  aria-label="분"
                  required
                />
              </label>
              <span className="vr-cert-form__dur-sep">:</span>
              <label className="vr-cert-form__dur-part">
                <span className="vr-form-note">초</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={59}
                  value={durS}
                  onChange={(e) => setDurS(e.target.value)}
                  aria-label="초"
                />
              </label>
            </div>
            {errors.duration ? (
              <p className="form-row__hint is-err" role="alert">
                {errors.duration}
              </p>
            ) : null}
            {pace ? (
              <p className="form-row__hint is-ok">평균 페이스 {pace}</p>
            ) : (
              <p className="form-row__hint">거리·시간 입력 시 페이스가 계산됩니다.</p>
            )}
          </FormRow>
        </div>

        <FormRow label="기록 도구" required>
          <div className="vr-recording-tools" role="radiogroup" aria-label="기록 도구">
            {RUNNING_RECORD_TOOLS.map((item) => (
              <label key={item.id} className="vr-recording-tools__item">
                <input
                  type="radio"
                  name="recordTool"
                  value={item.id}
                  checked={tool === item.id}
                  onChange={() => setTool(item.id)}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
          {errors.tool ? (
            <p className="form-row__hint is-err" role="alert">
              {errors.tool}
            </p>
          ) : null}
          {tool === "treadmill" ? (
            <p className="form-row__hint">트레드밀은 계기판 사진이 기록 스크린샷에 포함되어야 합니다.</p>
          ) : null}
        </FormRow>
      </FormSec>

      <FormSec kicker="02 / PROOF" title="증빙 사진">
        <VrFileField
          name="recordShot"
          label="기록 스크린샷"
          required
          hint="거리·시간·날짜가 한 화면에 보여야 합니다."
          error={errors.recordShot}
        />
        <VrFileField
          name="proofShot"
          label="인증샷"
          hint="배번호·피니시라인 등 키트 활용을 권장합니다. (선택)"
        />
      </FormSec>

      <FormSec kicker="03 / SNS" title="인스타그램">
        <VrFileField
          name="instaShot"
          label="인스타 게시물 스크린샷"
          required
          hint={`필수 해시태그: ${RUNNING_CERT_HASHTAGS}`}
          error={errors.instaShot}
        />
        <FormRow label="인스타 게시물 링크" required>
          <input
            type="url"
            name="instaUrl"
            className="is-wide"
            placeholder="https://www.instagram.com/p/…"
            value={instaUrl}
            onChange={(e) => setInstaUrl(e.target.value)}
            aria-invalid={Boolean(errors.instaUrl)}
          />
          {errors.instaUrl ? (
            <p className="form-row__hint is-err" role="alert">
              {errors.instaUrl}
            </p>
          ) : (
            <p className="form-row__hint">게시물(permalink) 또는 릴스 URL</p>
          )}
        </FormRow>
      </FormSec>

      <FormSec kicker="04 / AGREE" title="동의">
        <label className="vr-cert-check">
          <input type="checkbox" name="promoOk" checked={promoOk} onChange={(e) => setPromoOk(e.target.checked)} />
          <span>홍보 활용 동의 (선택) — 공식 채널 리그램·활용에 동의합니다.</span>
        </label>
        <label className="vr-cert-check">
          <input
            type="checkbox"
            name="pledgeOk"
            checked={pledgeOk}
            onChange={(e) => setPledgeOk(e.target.checked)}
            aria-invalid={Boolean(errors.pledge)}
          />
          <span>
            허위 제출 서약 (필수) — 허위로 확인될 경우 리워드 회수 등 조치에 동의합니다.
          </span>
        </label>
        {errors.pledge ? (
          <p className="form-row__hint is-err" role="alert">
            {errors.pledge}
          </p>
        ) : null}
      </FormSec>

      <div className="vr-cert-form__submit">
        <button type="submit" className="btn btn--red">
          러닝 인증 제출
        </button>
        <p className="vr-form-note">제출 후 심사·기프티콘·완주증은 리워드 내역에서 확인합니다.</p>
      </div>
    </form>
  );
}
