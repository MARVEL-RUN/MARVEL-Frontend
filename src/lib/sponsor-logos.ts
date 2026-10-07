import { COMING_SOON_ASSETS, MAIN_ASSETS } from "./assets";

export type SponsorRole = "주최" | "주관" | "주관사" | "미디어파트너";

const SIZE = {
  주최: { width: 4786, height: 1320 },
  주관: { width: 1601, height: 220 },
  주관사: { width: 510, height: 190 },
  미디어파트너: { width: 677, height: 183 },
} as const satisfies Record<SponsorRole, { width: number; height: number }>;

export function isSponsorRole(role: string): role is SponsorRole {
  return role in SIZE;
}

export function sponsorLogoSize(role: SponsorRole) {
  return SIZE[role];
}

export function comingSoonSponsorSrc(role: SponsorRole) {
  const map = {
    주최: COMING_SOON_ASSETS.host,
    주관: COMING_SOON_ASSETS.organizer,
    주관사: COMING_SOON_ASSETS.mFriends,
    미디어파트너: COMING_SOON_ASSETS.highcut,
  } as const;
  return map[role];
}

export function mainSponsorSrc(role: SponsorRole) {
  const map = {
    주최: MAIN_ASSETS.footerHost,
    주관: MAIN_ASSETS.footerOrganizer,
    주관사: MAIN_ASSETS.footerMFriends,
    미디어파트너: MAIN_ASSETS.footerHighcut,
  } as const;
  return map[role];
}

export function comingSoonSponsorLogoClass(role: SponsorRole) {
  const base = "sponsors__logo";
  switch (role) {
    case "주최":
      return `${base} sponsors__logo--host`;
    case "주관":
      return `${base} sponsors__logo--organizer`;
    case "주관사":
      return `${base} sponsors__logo--mfriends`;
    case "미디어파트너":
      return `${base} sponsors__logo--highcut`;
  }
}

export function mainSpecHostsLogoClass(role: SponsorRole) {
  switch (role) {
    case "주관":
      return "spec__hosts-logo spec__hosts-logo--organizer";
    case "주관사":
      return "spec__hosts-logo spec__hosts-logo--mfriends";
    case "미디어파트너":
      return "spec__hosts-logo spec__hosts-logo--highcut";
    default:
      return "spec__hosts-logo";
  }
}

export function virtualHostsLogoClass(role: SponsorRole) {
  switch (role) {
    case "주관":
      return "virtual-hosts__logo is-organizer";
    case "주관사":
      return "virtual-hosts__logo is-mfriends";
    case "미디어파트너":
      return "virtual-hosts__logo is-highcut";
    default:
      return "virtual-hosts__logo";
  }
}

export function footerHostLogoClass(role: SponsorRole) {
  switch (role) {
    case "주관":
      return "site-footer__host-logo site-footer__host-logo--organizer";
    case "주관사":
      return "site-footer__host-logo site-footer__host-logo--mfriends";
    case "미디어파트너":
      return "site-footer__host-logo site-footer__host-logo--highcut";
    default:
      return "site-footer__host-logo";
  }
}
