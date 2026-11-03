import type { VirtualRunKitItemKind } from "@/lib/virtual-run/kit";

export function kitSectionId(kind: VirtualRunKitItemKind) {
  if (kind === "medal-back") return "vr-kit-medal-front";
  return `vr-kit-${kind}`;
}
