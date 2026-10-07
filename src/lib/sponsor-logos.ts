import { MAIN_ASSETS } from "./assets";

export type FooterPartnerLogoKey = "host" | "organizer" | "mfriends" | "highcut";

const FOOTER_LOGO = {
  host: { src: MAIN_ASSETS.footerHost, width: 4786, height: 1320 },
  organizer: { src: MAIN_ASSETS.footerOrganizer, width: 1601, height: 220 },
  mfriends: { src: MAIN_ASSETS.footerMFriends, width: 510, height: 190 },
  highcut: { src: MAIN_ASSETS.footerHighcut, width: 677, height: 183 },
} as const satisfies Record<
  FooterPartnerLogoKey,
  { src: string; width: number; height: number }
>;

export function footerPartnerLogo(key: FooterPartnerLogoKey) {
  return FOOTER_LOGO[key];
}

export function footerPartnerLogoClass(key: FooterPartnerLogoKey) {
  switch (key) {
    case "organizer":
      return "site-footer__host-logo site-footer__host-logo--organizer";
    case "mfriends":
      return "site-footer__host-logo site-footer__host-logo--mfriends";
    case "highcut":
      return "site-footer__host-logo site-footer__host-logo--highcut";
    default:
      return "site-footer__host-logo";
  }
}
