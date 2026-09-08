import type { LegalNode, LegalSection } from "@/lib/legal";

export function LegalBlocks({ nodes }: { nodes: LegalNode[] }) {
  return (
    <div className="legal">
      {nodes.map((node, i) => {
        if (node.kind === "p") return <p key={i}>{node.text}</p>;
        if (node.kind === "h") return <h3 key={i}>{node.text}</h3>;
        if (node.kind === "note") return <p key={i} className="legal__note">{node.text}</p>;
        if (node.kind === "ul") {
          return (
            <ul key={i}>
              {node.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        return (
          <div key={i} className="legal-table-wrap">
            <table className="legal-table">
              <thead>
                <tr>
                  {node.headers.map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {node.rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

export function LegalSections({
  sections,
  lead,
  effective,
}: {
  sections: LegalSection[];
  lead?: readonly string[];
  effective?: string;
}) {
  return (
    <div className="legal-doc">
      {lead?.map((p) => (
        <p key={p} className="sec__body">
          {p}
        </p>
      ))}
      {sections.map((section) => (
        <section key={section.title} className="block">
          <h2>{section.title}</h2>
          <LegalBlocks nodes={section.nodes} />
        </section>
      ))}
      {effective ? <p className="legal__effective">{effective}</p> : null}
    </div>
  );
}
