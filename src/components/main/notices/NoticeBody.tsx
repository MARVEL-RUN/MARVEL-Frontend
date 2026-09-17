/* ==문구== 형광펜 / ■ 소제목 / 1. → ① / |표| */

import { type ReactNode } from "react";

const CIRCLE = "①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳";

export function NoticeBody({ text }: { text: string }) {
  return (
    <div className="notice-body">
      {blocksOf(text).map((block, i) => {
        if (block.kind === "gap") return <div key={i} className="notice-gap" />;

        if (block.kind === "table") {
          const [headers, ...rows] = block.rows;
          return (
            <div key={i} className="notice-table-wrap">
              <table className="notice-table">
                <thead>
                  <tr>
                    {headers.map((cell) => (
                      <th key={cell}>{cell}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, ri) => (
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
        }

        const numbered = /^(\d+)\.\s+(.*)$/.exec(block.text);
        if (numbered) {
          return (
            <div key={i} className="notice-ol">
              <span className="notice-ol__no">{circleNo(Number(numbered[1]))}</span>
              <span className="notice-ol__text">{renderMarks(numbered[2], i)}</span>
            </div>
          );
        }

        const heading = /^■\s*(.+)$/.exec(block.text);
        if (heading) {
          return (
            <div key={i} className="notice-line">
              ■{" "}
              <mark className="notice-hl notice-hl--head">{heading[1]}</mark>
            </div>
          );
        }

        return (
          <div key={i} className="notice-line">
            {renderMarks(block.text, i)}
          </div>
        );
      })}
    </div>
  );
}

type Block =
  | { kind: "gap" }
  | { kind: "line"; text: string }
  | { kind: "table"; rows: string[][] };

function blocksOf(text: string): Block[] {
  const lines = text.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    if (isTableLine(lines[i])) {
      const rows: string[][] = [];
      while (i < lines.length && isTableLine(lines[i])) {
        rows.push(cellsOf(lines[i]));
        i += 1;
      }
      if (rows.length >= 2) blocks.push({ kind: "table", rows });
      else blocks.push({ kind: "line", text: lines[i - 1] });
      continue;
    }

    if (lines[i] === "") blocks.push({ kind: "gap" });
    else blocks.push({ kind: "line", text: lines[i] });
    i += 1;
  }

  return blocks;
}

function isTableLine(line: string) {
  return /^\|.+\|$/.test(line);
}

function cellsOf(line: string) {
  return line
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim());
}

function circleNo(n: number) {
  if (n >= 1 && n <= CIRCLE.length) return CIRCLE[n - 1];
  return `${n}.`;
}

function renderMarks(text: string, lineKey: number) {
  const nodes: ReactNode[] = [];
  const re = /==(.+?)==/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = re.exec(text))) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    nodes.push(
      <mark key={`${lineKey}-${i}`} className="notice-hl">
        {match[1]}
      </mark>,
    );
    i += 1;
    last = match.index + match[0].length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}
