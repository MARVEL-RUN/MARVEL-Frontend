import type { VirtualRunStatusTone } from "@/lib/virtual-run/status";

export function VrStatus({ tone, children }: { tone: VirtualRunStatusTone; children: React.ReactNode }) {
  return <span className={`vr-status vr-status--${tone}`}>{children}</span>;
}
