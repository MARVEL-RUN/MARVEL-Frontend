"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type MvEl = HTMLElement & { loaded?: boolean };

const ORBIT = "18deg 80deg auto";

const blobUrls = new Map<string, string>();
const blobJobs = new Map<string, { promise: Promise<string>; notify: Set<(n: number) => void> }>();

/* model-viewer 진행률은 환경맵과 합쳐져 처음부터 높게 뜀 */

function loadMedalBlob(src: string, onProgress: (n: number) => void) {
  const cached = blobUrls.get(src);
  if (cached) {
    onProgress(1);
    return Promise.resolve(cached);
  }

  let job = blobJobs.get(src);
  if (!job) {
    const notify = new Set<(n: number) => void>();
    const promise = (async () => {
      const res = await fetch(src);
      if (!res.ok) throw new Error(String(res.status));
      const total = Number(res.headers.get("content-length")) || 0;
      const reader = res.body?.getReader();
      if (!reader) {
        const url = URL.createObjectURL(await res.blob());
        blobUrls.set(src, url);
        notify.forEach((fn) => fn(1));
        return url;
      }

      const chunks: Uint8Array[] = [];
      let received = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.byteLength;
        if (total > 0) notify.forEach((fn) => fn(received / total));
      }

      const url = URL.createObjectURL(new Blob(chunks));
      blobUrls.set(src, url);
      notify.forEach((fn) => fn(1));
      return url;
    })().finally(() => {
      blobJobs.delete(src);
    });

    job = { promise, notify };
    blobJobs.set(src, job);
  }

  job.notify.add(onProgress);
  return job.promise.finally(() => {
    job.notify.delete(onProgress);
  });
}

let rotateHintDone = false;
const hintSubs = new Set<() => void>();

function dismissRotateHint() {
  rotateHintDone = true;
  hintSubs.forEach((fn) => fn());
}

function useRotateHint(ready: boolean) {
  const [show, setShow] = useState(() => !rotateHintDone);

  useEffect(() => {
    const hide = () => setShow(false);
    hintSubs.add(hide);
    return () => {
      hintSubs.delete(hide);
    };
  }, []);

  return ready && show;
}

function useModelViewer() {
  useEffect(() => {
    void import("@google/model-viewer");
  }, []);
}

function useMedalModel(fileSrc: string) {
  const ref = useRef<MvEl>(null);
  const [blobSrc, setBlobSrc] = useState<string>();
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    setBlobSrc(undefined);
    setProgress(0);
    setReady(false);
    setFailed(false);

    loadMedalBlob(fileSrc, (p) => {
      if (live) setProgress(p);
    })
      .then((url) => {
        if (live) {
          setProgress(1);
          setBlobSrc(url);
        }
      })
      .catch(() => {
        if (live) setFailed(true);
      });

    return () => {
      live = false;
    };
  }, [fileSrc]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !blobSrc) return;

    const onLoad = () => setReady(true);
    const onError = () => setFailed(true);
    el.addEventListener("load", onLoad);
    el.addEventListener("error", onError);
    if (el.loaded) onLoad();

    return () => {
      el.removeEventListener("load", onLoad);
      el.removeEventListener("error", onError);
    };
  }, [blobSrc]);

  return { ref, blobSrc, progress, ready, failed };
}

function LoadCover({
  progress,
  ready,
  failed,
}: {
  progress: number;
  ready: boolean;
  failed: boolean;
}) {
  if (ready) return null;
  const pct = Math.round(progress * 100);
  const label = failed
    ? "불러오지 못했습니다"
    : pct >= 100
      ? "표시하는 중"
      : pct > 0
        ? `불러오는 중 ${pct}%`
        : "불러오는 중";

  return (
    <div className="medal-3d__load" aria-live="polite">
      {failed ? null : <span className="medal-3d__spin" />}
      <p>{label}</p>
      {failed ? null : (
        <span className={`medal-3d__bar${pct > 0 ? "" : " is-wait"}`}>
          <i style={pct > 0 ? { width: `${Math.min(pct, 100)}%` } : undefined} />
        </span>
      )}
    </div>
  );
}

function ModelStage({
  src,
  alt,
  poster,
  wide,
}: {
  src: string;
  alt: string;
  poster?: string;
  wide?: boolean;
}) {
  const { ref, blobSrc, progress, ready, failed } = useMedalModel(src);
  const hint = useRotateHint(ready);

  return (
    <div className="medal-3d__stage">
      <model-viewer
        ref={ref}
        className="kit-gallery__viewer"
        src={blobSrc}
        alt={alt}
        poster={poster}
        loading="eager"
        camera-controls
        camera-orbit={wide ? "18deg 78deg 110%" : ORBIT}
        field-of-view={wide ? "45deg" : "32deg"}
        min-field-of-view={wide ? "12deg" : "32deg"}
        max-field-of-view={wide ? "60deg" : "32deg"}
        touch-action={wide ? "none" : "pan-y"}
        {...(wide ? {} : { "disable-zoom": true, "disable-tap": true })}
        shadow-intensity="1"
        exposure="1.05"
        environment-image="neutral"
        interaction-prompt="none"
        suppressHydrationWarning
      />
      <LoadCover progress={progress} ready={ready} failed={failed} />
      {hint ? (
        <button type="button" className="medal-3d__hint" onClick={() => dismissRotateHint()}>
          <p>클릭하여 회전해 보세요</p>
        </button>
      ) : null}
    </div>
  );
}

function Medal3dPreview({
  src,
  alt,
  poster,
  onClose,
}: {
  src: string;
  alt: string;
  poster?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="course-preview medal-3d-preview"
      role="dialog"
      aria-modal="true"
      aria-labelledby="medal-3d-title"
    >
      <button
        type="button"
        className="course-preview__dim"
        onClick={onClose}
        aria-label="미리보기 닫기"
      />
      <div className="course-preview__sheet">
        <header className="course-preview__bar">
          <p className="course-preview__kicker">PREVIEW</p>
          <h3 id="medal-3d-title">{alt}</h3>
          <button type="button" className="course-preview__close" onClick={onClose}>
            닫기
          </button>
        </header>
        <div className="course-preview__stage medal-3d-preview__stage">
          <ModelStage src={src} alt={alt} poster={poster} wide />
        </div>
        <p className="course-preview__foot">드래그로 회전 · 스크롤로 확대·축소 · Esc로 닫기</p>
      </div>
    </div>
  );
}

export function MedalViewer({
  src,
  alt,
  poster,
}: {
  src: string;
  alt: string;
  poster?: string;
}) {
  const [open, setOpen] = useState(false);
  useModelViewer();

  return (
    <>
      <ModelStage src={src} alt={alt} poster={poster} />
      <button
        type="button"
        className="medal-3d__expand"
        onClick={() => setOpen(true)}
        aria-label="크게 보기"
        title="크게 보기"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="square"
            d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"
          />
        </svg>
      </button>
      {open
        ? createPortal(
            <Medal3dPreview
              src={src}
              alt={alt}
              poster={poster}
              onClose={() => setOpen(false)}
            />,
            document.body,
          )
        : null}
    </>
  );
}
