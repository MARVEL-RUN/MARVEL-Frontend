import { PRIVACY, PRIVACY_EFFECTIVE, PRIVACY_LEAD } from "@/lib/privacy";
import { TERMS, TERMS_EFFECTIVE, type LegalSection } from "@/lib/legal";
import { nodesToText, textToNodes } from "@/lib/admin/legalText";
import { readStore, wait, writeStore } from "@/lib/admin/store";

export type LegalDocKind = "terms" | "privacy";

export type LegalDocDraft = {
  lead: string;
  effective: string;
  sections: { title: string; body: string }[];
};

const KEYS: Record<LegalDocKind, string> = {
  terms: "mr-admin-legal-terms",
  privacy: "mr-admin-legal-privacy",
};

function seed(kind: LegalDocKind): LegalDocDraft {
  if (kind === "terms") {
    return {
      lead: "",
      effective: TERMS_EFFECTIVE,
      sections: TERMS.map((section) => ({
        title: section.title,
        body: nodesToText(section.nodes),
      })),
    };
  }
  return {
    lead: PRIVACY_LEAD.join("\n\n"),
    effective: PRIVACY_EFFECTIVE,
    sections: PRIVACY.map((section) => ({
      title: section.title,
      body: nodesToText(section.nodes),
    })),
  };
}

export async function getLegalDoc(kind: LegalDocKind) {
  await wait();
  return readStore(KEYS[kind], seed(kind));
}

export async function saveLegalDoc(kind: LegalDocKind, draft: LegalDocDraft) {
  await wait();
  writeStore(KEYS[kind], draft);
  return draft;
}

export function draftToSections(draft: LegalDocDraft): LegalSection[] {
  return draft.sections
    .filter((section) => section.title.trim())
    .map((section) => ({
      title: section.title.trim(),
      nodes: textToNodes(section.body),
    }));
}

export function draftLead(draft: LegalDocDraft) {
  return draft.lead
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}
