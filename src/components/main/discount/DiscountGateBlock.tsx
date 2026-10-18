export function DiscountGateBlock({ children }: { children: React.ReactNode }) {
  return (
    <section className="dl-stage dl-gate">
      <div className="wrap dl-gate__inner">
        <p className="dl-gate__tag">SPECIAL ACCESS</p>
        <div className="dl-gate__card">{children}</div>
      </div>
    </section>
  );
}
