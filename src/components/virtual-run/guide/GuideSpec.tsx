import type { VirtualRunGuideField, VirtualRunGuideRow } from "@/lib/virtual-run/guide";

export function GuideSpec({ rows }: { rows: VirtualRunGuideRow[] }) {
  return (
    <dl className="spec">
      {rows.map((row) => (
        <div key={row.label}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function GuideFields({ fields }: { fields: VirtualRunGuideField[] }) {
  return (
    <dl className="spec vr-fields">
      {fields.map((f) => (
        <div key={f.label}>
          <dt>{f.label}</dt>
          <dd>
            <span className={f.required ? "vr-req" : "vr-req is-opt"}>{f.required ? "필수" : "선택"}</span>
            {f.rule}
          </dd>
        </div>
      ))}
    </dl>
  );
}
