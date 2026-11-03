import { VrLink } from "../layout/VrLink";

type Props = {
  mode: "approved" | "pending";
  subject: string;
  rows?: { label: string; value: string }[];
  approvedNote?: string;
  onAgain?: () => void;
  againLabel?: string;
};

export function CertSubmitResult({ mode, subject, rows, approvedNote, onAgain, againLabel }: Props) {
  const approved = mode === "approved";

  return (
    <section className="ticket ticket--done vr-result">
      <span className="kicker">{approved ? "APPROVED" : "IN REVIEW"}</span>
      <h2>
        {subject}이 <em>{approved ? "승인" : "접수"}</em>되었습니다
      </h2>
      <p className="ticket__meta">
        {approved
          ? (approvedNote ?? "리워드는 등록된 휴대폰 번호로 발송됩니다.")
          : "운영진 검수 후 48시간 안에 결과를 문자로 알려 드립니다."}
      </p>
      {rows?.length ? (
        <dl className="spec">
          {rows.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <div className="flow__nav">
        {onAgain ? (
          <button type="button" className="btn btn--ghost" onClick={onAgain}>
            {againLabel ?? "다시 제출"}
          </button>
        ) : null}
        <VrLink href="/mypage" className="btn btn--red">
          마이페이지
        </VrLink>
      </div>
    </section>
  );
}
