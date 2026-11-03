import Image from "next/image";
import { EVENT } from "@/lib/event";
import { footerPartnerLogo, guideSpecHostsLogoClass } from "@/lib/sponsor-logos";
import { VIRTUAL_RUN_OVERVIEW_ROWS } from "@/lib/virtual-run/event";

export function OverviewTable() {
  return (
    <div className="vr-overview">
      <div className="vr-overview__group">
        <h3 className="vr-overview__title">행사 정보</h3>
        <dl className="spec">
          {VIRTUAL_RUN_OVERVIEW_ROWS.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>
                {row.value}
                {row.note ? <small>{row.note}</small> : null}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="vr-overview__group">
        <h3 className="vr-overview__title">주최 · 파트너</h3>
        <dl className="spec">
          {EVENT.footerPartners.map((group) => (
            <div key={group.role}>
              <dt>{group.role}</dt>
              <dd>
                <span className="spec__hosts">
                  {group.items.map((item) => {
                    const logo = footerPartnerLogo(item.key);
                    return (
                      <Image
                        key={item.key}
                        src={logo.src}
                        alt={item.name}
                        width={logo.width}
                        height={logo.height}
                        className={guideSpecHostsLogoClass(item.key)}
                      />
                    );
                  })}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
