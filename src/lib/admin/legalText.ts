import type { LegalNode } from "@/lib/legal";

export function nodesToText(nodes: LegalNode[]): string {
  return nodes
    .map((node) => {
      if (node.kind === "p") return node.text;
      if (node.kind === "h") return `## ${node.text}`;
      if (node.kind === "note") return `> ${node.text}`;
      if (node.kind === "ul") return node.items.map((item) => `- ${item}`).join("\n");
      return [
        "[표]",
        node.headers.join(" | "),
        ...node.rows.map((row) => row.join(" | ")),
        "[/표]",
      ].join("\n");
    })
    .join("\n\n");
}

export function textToNodes(text: string): LegalNode[] {
  const blocks = text.replace(/\r\n/g, "\n").trim().split(/\n{2,}/);
  const nodes: LegalNode[] = [];

  for (const block of blocks) {
    const raw = block.trim();
    if (!raw) continue;

    if (raw.startsWith("[표]")) {
      const inner = raw.replace("[표]", "").replace("[/표]", "").trim();
      const lines = inner
        .split("\n")
        .map((line) => line.split(" | ").map((cell) => cell.trim()))
        .filter((line) => line.some(Boolean));
      nodes.push({
        kind: "table",
        headers: lines[0] ?? [],
        rows: lines.slice(1),
      });
      continue;
    }

    if (raw.startsWith("## ")) {
      nodes.push({ kind: "h", text: raw.slice(3).trim() });
      continue;
    }

    if (raw.startsWith("> ")) {
      nodes.push({ kind: "note", text: raw.replace(/^>\s?/, "") });
      continue;
    }

    const lines = raw.split("\n");
    const bullets = lines.filter((line) => line.startsWith("- "));
    const rest = lines.filter((line) => !line.startsWith("- "));
    if (rest.length) nodes.push({ kind: "p", text: rest.join("\n") });
    if (bullets.length) {
      nodes.push({ kind: "ul", items: bullets.map((line) => line.slice(2).trim()) });
    }
  }

  return nodes;
}
