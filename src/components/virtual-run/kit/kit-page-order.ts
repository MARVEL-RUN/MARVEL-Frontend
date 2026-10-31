import type { VirtualRunKitItem } from "@/lib/virtual-run/kit";

export type KitPageSlots = {
  packageFull: VirtualRunKitItem | null | undefined;
  carton: VirtualRunKitItem | null | undefined;
  medalFront: VirtualRunKitItem | null | undefined;
  medalBack: VirtualRunKitItem | null | undefined;
  col1Tail: VirtualRunKitItem | null | undefined;
  medalCase: VirtualRunKitItem | null | undefined;
  bib: VirtualRunKitItem | null | undefined;
  col2Foot: VirtualRunKitItem | null | undefined;
  finish: VirtualRunKitItem | null | undefined;
};

/** VirtualRunKitGallery 앵커·이미지가 나오는 순서 */
export function kitItemsInPageOrder(slots: KitPageSlots): VirtualRunKitItem[] {
  const list: VirtualRunKitItem[] = [];
  const push = (item: VirtualRunKitItem | null | undefined) => {
    if (item) list.push(item);
  };
  push(slots.packageFull);
  push(slots.carton);
  push(slots.medalFront);
  push(slots.medalBack);
  push(slots.col1Tail);
  push(slots.medalCase);
  push(slots.bib);
  push(slots.col2Foot);
  push(slots.finish);
  return list;
}
