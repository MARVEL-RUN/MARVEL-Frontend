"use client";

import { FormEvent, useState } from "react";
import { FormRow, FormSec } from "@/components/main/register/ApplyUi";
import { demoInstantApproveSpot } from "@/lib/virtual-run/cert-demo";
import { virtualRunDemoEnabled } from "@/lib/virtual-run/site";
import { isInstagramPostUrl, localDateYmd } from "@/lib/virtual-run/running-cert";
import { SPOT_CERT_HASHTAGS, VIRTUAL_RUN_SPOTS, type VirtualRunSpotId } from "@/lib/virtual-run/spots";
import { useVirtualRunParticipantOrDemo } from "../participant/VirtualRunParticipantProvider";
import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { CertSubmitResult } from "./CertSubmitResult";
import { HashtagCopy } from "./HashtagCopy";
import { VrFileField } from "./VrFileField";
import { VrMypageGate } from "./VrMypageGate";

function hasFile(fd: FormData, name: string): boolean {
  const v = fd.get(name);
  return v instanceof File && v.size > 0;
}

export function VirtualRunSpotsPage() {
  const { participant, update } = useVirtualRunParticipantOrDemo();
  const [pick, setPick] = useState<VirtualRunSpotId | "">("");
  const [visitDate, setVisitDate] = useState("");
  const [instaUrl, setInstaUrl] = useState("");
  const [result, setResult] = useState<{ mode: "approved" | "pending"; label: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isDone = (id: VirtualRunSpotId) =>
    participant.spots[id] === "approved" || participant.spots[id] === "pending";
  const openSpots = VIRTUAL_RUN_SPOTS.filter((s) => !isDone(s.id));
  const spotId = pick && !isDone(pick) ? pick : openSpots[0]?.id;
  const spot = VIRTUAL_RUN_SPOTS.find((s) => s.id === spotId);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!spot) return;
    const fd = new FormData(e.currentTarget);
    const next: Record<string, string> = {};
    if (!visitDate) next.visitDate = "방문 날짜를 선택해 주세요.";
    if (!hasFile(fd, "spotShot")) next.spotShot = "거점 인증샷을 첨부해 주세요.";
    if (!hasFile(fd, "instaShot")) next.instaShot = "게시물 스크린샷을 첨부해 주세요.";
    if (!instaUrl.trim()) next.instaUrl = "게시물 링크를 입력해 주세요.";
    else if (!isInstagramPostUrl(instaUrl)) {
      next.instaUrl = "instagram.com/p/ 또는 /reel/ 로 시작하는 주소를 넣어 주세요.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    if (virtualRunDemoEnabled) {
      update(demoInstantApproveSpot(participant, spot.id, spot.label));
      setResult({ mode: "approved", label: spot.label });
    } else {
      update({ ...participant, spots: { ...participant.spots, [spot.id]: "pending" } });
      setResult({ mode: "pending", label: spot.label });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <VirtualRunSubPage kicker="MY PAGE" title="거점 이벤트" en="SPOT">
      <div className="page__body wrap">
        <VrMypageGate>
          {result ? (
            <CertSubmitResult
              mode={result.mode}
              subject="거점 인증"
              rows={[
                { label: "거점", value: result.label },
                { label: "방문 날짜", value: visitDate },
              ]}
              approvedNote="협력사 쿠폰 코드를 등록된 휴대폰 번호로 보냈습니다."
              onAgain={
                openSpots.length > 0
                  ? () => {
                      setResult(null);
                      setPick("");
                      setVisitDate("");
                      setInstaUrl("");
                    }
                  : undefined
              }
              againLabel="다른 거점 인증"
            />
          ) : !spot ? (
            <section className="block wait">
              <span className="kicker">ALL CLEAR</span>
              <h2>모든 거점 인증을 마쳤습니다</h2>
              <p className="sec__body">거점별 인증은 1회만 할 수 있습니다.</p>
            </section>
          ) : (
            <form className="form vr-cert-form" onSubmit={onSubmit} noValidate>
              <header className="form__head">
                <h2>거점 인증</h2>
                <p className="form__note">협업 거점을 방문해 인증하면 거점 쿠폰을 드립니다. 거점별 1회.</p>
              </header>

              <FormSec kicker="01 / SPOT" title="방문 정보">
                <FormRow label="거점" required>
                  <div className="seg" role="radiogroup" aria-label="거점">
                    {VIRTUAL_RUN_SPOTS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        role="radio"
                        aria-checked={spotId === s.id}
                        className={spotId === s.id ? "is-on" : undefined}
                        disabled={isDone(s.id)}
                        onClick={() => setPick(s.id)}
                      >
                        {s.label}
                        {isDone(s.id) ? " · 완료" : ""}
                      </button>
                    ))}
                  </div>
                  <p className="form-row__hint">{spot.note}</p>
                </FormRow>
                <FormRow label="방문 날짜" required>
                  <input
                    type="date"
                    name="visitDate"
                    value={visitDate}
                    max={localDateYmd()}
                    onChange={(e) => setVisitDate(e.target.value)}
                    aria-invalid={Boolean(errors.visitDate)}
                  />
                  {errors.visitDate ? (
                    <p className="form-row__hint is-err" role="alert">
                      {errors.visitDate}
                    </p>
                  ) : null}
                </FormRow>
                <VrFileField
                  name="spotShot"
                  label="거점 인증샷"
                  required
                  hint="거점 로고나 포토존이 보이게 찍어 주세요."
                  error={errors.spotShot}
                />
              </FormSec>

              <FormSec kicker="02 / INSTAGRAM" title="인스타 인증">
                <HashtagCopy tags={SPOT_CERT_HASHTAGS} />
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
                    className="is-wide"
                    placeholder="https://www.instagram.com/p/..."
                    value={instaUrl}
                    onChange={(e) => setInstaUrl(e.target.value)}
                    aria-invalid={Boolean(errors.instaUrl)}
                  />
                  {errors.instaUrl ? (
                    <p className="form-row__hint is-err" role="alert">
                      {errors.instaUrl}
                    </p>
                  ) : null}
                </FormRow>
              </FormSec>

              <div className="flow__nav">
                <button type="submit" className="btn btn--red">
                  제출하기
                </button>
              </div>
            </form>
          )}
        </VrMypageGate>
      </div>
    </VirtualRunSubPage>
  );
}
