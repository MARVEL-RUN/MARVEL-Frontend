import type { VirtualRunOpenFlags } from "./open-schedule";
import { VIRTUAL_RUN_NAV } from "./nav";
import { virtualRunSpotsEnabled } from "./site";

export function visibleVirtualRunNav(flags: VirtualRunOpenFlags) {
  return VIRTUAL_RUN_NAV.filter((item) => {
    if (item.href === "/tickets") return flags.tickets;
    if (item.href === "/guide") return flags.guide;
    if (item.href === "/mypage") return flags.mypageLogin;
    return flags.publicInfo;
  });
}

export function visibleVirtualRunMypageNav() {
  return virtualRunSpotsEnabled;
}
