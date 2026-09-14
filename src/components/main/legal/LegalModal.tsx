"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  LEGAL_DOCS,
  PARTICIPANT_NOTICE,
  TERMS,
  TERMS_EFFECTIVE,
  type LegalDocId,
  type LegalSection,
} from "@/lib/legal";
import { PRIVACY, PRIVACY_EFFECTIVE, PRIVACY_LEAD } from "@/lib/privacy";
import { draftLead, draftToSections, getLegalDoc } from "@/services/admin/legal";
import { LegalBlocks, LegalSections } from "./LegalBlocks";

type LegalModalContextValue = {
  open: (id: LegalDocId) => void;
};

const LegalModalContext = createContext<LegalModalContextValue>({
  open: () => { },
});

export function useLegalModal() {
  return useContext(LegalModalContext);
}

export function LegalModalProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<LegalDocId | null>(null);
  const open = useCallback((next: LegalDocId) => setId(next), []);
  const close = useCallback(() => setId(null), []);

  return (
    <LegalModalContext.Provider value={{ open }}>
      {children}
      {id ? <LegalDialog id={id} onClose={close} /> : null}
    </LegalModalContext.Provider>
  );
}

export function LegalDocPage({ id }: { id: LegalDocId }) {
  const router = useRouter();
  const onClose = useCallback(() => router.replace("/"), [router]);
  return <LegalDialog id={id} onClose={onClose} />;
}

function LegalDialog({ id, onClose }: { id: LegalDocId; onClose: () => void }) {
  const doc = LEGAL_DOCS.find((item) => item.id === id);
  if (!doc) return null;

  return <LegalDialogFrame doc={doc} onClose={onClose} />;
}

function LegalDialogFrame({
  doc,
  onClose,
}: {
  doc: (typeof LEGAL_DOCS)[number];
  onClose: () => void;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="legal-modal" role="dialog" aria-modal="true" aria-labelledby="legal-modal-label">
      <button type="button" className="legal-modal__dim" onClick={onClose} aria-label="닫기" />
      <div className="legal-modal__panel">
        <header className="legal-modal__head">
          <h2 id="legal-modal-label">{doc.label}</h2>
          <button type="button" className="legal-modal__x" onClick={onClose} aria-label="닫기">
            ×
          </button>
        </header>
        <div className="legal-modal__main">
          <div className="legal-modal__frame">
            <div className="legal-modal__body">
              <p className="legal-modal__heading">{doc.heading}</p>
              <LegalDocBody id={doc.id} />
            </div>
          </div>
          <div className="legal-modal__foot">
            <button type="button" className="legal-modal__ok" onClick={onClose}>
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegalDocBody({ id }: { id: LegalDocId }) {
  if (id === "precautions") {
    return (
      <div className="legal-doc">
        {PARTICIPANT_NOTICE.map((section) => (
          <section key={section.title} className="block">
            <h2>{section.title}</h2>
            <LegalBlocks nodes={section.nodes} />
          </section>
        ))}
      </div>
    );
  }

  return <FetchedLegal id={id} />;
}

function FetchedLegal({ id }: { id: "terms" | "privacy" }) {
  const seeded = id === "terms"
    ? { sections: TERMS, lead: undefined as string[] | undefined, effective: TERMS_EFFECTIVE }
    : { sections: PRIVACY, lead: [...PRIVACY_LEAD], effective: PRIVACY_EFFECTIVE };
  const [sections, setSections] = useState<LegalSection[]>(seeded.sections);
  const [lead, setLead] = useState<readonly string[] | undefined>(seeded.lead);
  const [effective, setEffective] = useState(seeded.effective);

  useEffect(() => {
    void getLegalDoc(id).then((draft) => {
      setSections(draftToSections(draft));
      setLead(draftLead(draft));
      setEffective(draft.effective);
    });
  }, [id]);

  return <LegalSections sections={sections} lead={lead} effective={effective} />;
}
