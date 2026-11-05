import { VIRTUAL_RUN_ORIGIN_STATS } from "@/lib/virtual-run/event";

export function VirtualRunHomeOrigin() {
  return (
    <section className="sec about vr-home__origin" id="origin">
      <div className="wrap reveal">
        <div className="about__copy">
          <p className="kicker">ORIGIN</p>
          <h2 className="sec__title">
            <span className="vr-home__origin-accent">둠스데이</span>를 향해 달려라!
          </h2>
          <p className="sec__body">
            마블 버추얼 런은 정해진 코스 없이{" "}
            <span className="vr-home__hl">
              내가 원하는 시간과 장소에서 자유롭게 참여할 수 있는 온라인 러닝 프로그램입니다.
            </span>
          </p>
          <p className="sec__body">
            <span className="vr-home__hl">집에서도, 헬스장에서도 가능!</span>
          </p>
          <p className="sec__body">
            어디서든 원하는 시간에 레이스를 완주하고 한정판 메달과 함께 다양한 경품도 놓치지
            마세요!
          </p>
        </div>
        <ul className="about__stats vr-home__origin-stats">
          {VIRTUAL_RUN_ORIGIN_STATS.map((stat) => (
            <li key={stat.label}>
              <strong>
                <b>{stat.value}</b>
                {stat.unit ? <span>{stat.unit}</span> : null}
              </strong>
              <em>{stat.label}</em>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
