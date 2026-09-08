import { SideBanner } from "../layout/SideBanner";

export function VirtualRunPage() {
  return (
    <main className="page">
      <SideBanner kicker="VIRTUAL" title="버추얼런" en="VIRTUAL RUN" />
      <div className="page__body wrap wrap--narrow">
        <section className="block wait">
          <h2>버추얼런</h2>
          <p className="sec__body">상세 안내는 준비 중입니다.</p>
        </section>
      </div>
    </main>
  );
}
