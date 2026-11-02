type Props = {
  mode: "approved" | "pending";
  title?: string;
  onAgain?: () => void;
  againLabel?: string;
};

export function CertSubmitResult({ mode, title, onAgain, againLabel }: Props) {
  const head =
    title ??
    (mode === "approved"
      ? "승인 완료 · 기프티콘 발송 (데모)"
      : "검수 중 (48시간 이내 안내 예정)");

  return (
    <article className="vr-panel vr-cert-done">
      <h2>{head}</h2>
      <p>
        {mode === "approved"
          ? "데모 모드에서는 제출 즉시 승인 처리됩니다. 실서비스에서는 AI 대조 후 자동 승인 또는 검수 대기로 표시됩니다."
          : "운영자 검수가 필요한 제출은 마이페이지 회차 카드에서 상태를 확인할 수 있습니다."}
      </p>
      {onAgain ? (
        <button type="button" className="btn btn--ghost vr-stack-sm" onClick={onAgain}>
          {againLabel ?? "다시 제출하기"}
        </button>
      ) : null}
    </article>
  );
}
