import Image from "next/image";
import { EVENT } from "@/lib/event";
import { footerPartnerLogo, guideSpecHostsLogoClass } from "@/lib/sponsor-logos";
import { VIRTUAL_RUN_OVERVIEW_ROWS } from "@/lib/virtual-run/event";

export function OverviewTable() {
  return (
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
  );
}
