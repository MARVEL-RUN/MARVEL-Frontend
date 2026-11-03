import type { VirtualRunOpenFlags } from "./open-schedule";
import {
  isVirtualRunNavGroup,
  VIRTUAL_RUN_NAV_ITEMS,
  type VirtualRunNavChild,
  type VirtualRunNavItem,
} from "./nav";
import { virtualRunSpotsEnabled } from "./site";

function childVisible(child: VirtualRunNavChild, flags: VirtualRunOpenFlags): boolean {
  if (child.spotsOnly && !virtualRunSpotsEnabled) return false;
  if (!child.openFlag) return true;
  return flags[child.openFlag];
}

function filterChildren(
  children: readonly VirtualRunNavChild[],
  flags: VirtualRunOpenFlags,
  groupFlag?: keyof VirtualRunOpenFlags,
): VirtualRunNavChild[] {
  const base = groupFlag ? flags[groupFlag] : true;
  if (!base) return [];
  return children.filter((c) => childVisible(c, flags));
}

function filterItem(item: VirtualRunNavItem, flags: VirtualRunOpenFlags): VirtualRunNavItem | null {
  if (item.openFlag && !flags[item.openFlag]) return null;
  if (!isVirtualRunNavGroup(item)) return item;
  const children = filterChildren(item.children, flags, item.openFlag);
  if (children.length === 0) return null;
  return { ...item, children };
}

export function visibleVirtualRunNav(flags: VirtualRunOpenFlags): VirtualRunNavItem[] {
  return VIRTUAL_RUN_NAV_ITEMS.map((item) => filterItem(item, flags)).filter(
    (item): item is VirtualRunNavItem => item != null,
  );
}
