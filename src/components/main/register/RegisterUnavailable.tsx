type Props = {
  onRetry: () => void;
  busy?: boolean;
};

export function RegisterUnavailable({ onRetry, busy }: Props) {
  return (
    <section className="block wait register-down" aria-labelledby="register-down-title">
      <p className="kicker">STANDBY</p>
      <h2 id="register-down-title">접속이 원활하지 않습니다</h2>
      <p className="register-down__chip">서버 응답 없음</p>
      <p className="sec__body">
        잠시 후 다시 시도해 주세요. 새로고침을 반복하면 접속이 더 어려워질 수 있습니다.
      </p>
      <div className="flow__nav">
        <button
          type="button"
          className="btn btn--red"
          onClick={onRetry}
          disabled={busy}
        >
          {busy ? "확인 중" : "다시 시도"}
        </button>
      </div>
    </section>
  );
}
