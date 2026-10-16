import { MAIN_ASSETS } from "./assets";

export type FooterPartnerLogoKey =
  | "host"
  | "organizer"
  | "mfriends"
  | "highcut"
  | "melon";

const FOOTER_LOGO = {
  host: { src: MAIN_ASSETS.footerHost, width: 4786, height: 1320 },
  organizer: { src: MAIN_ASSETS.footerOrganizer, width: 1601, height: 220 },
  mfriends: { src: MAIN_ASSETS.footerMFriends, width: 510, height: 190 },
  highcut: { src: MAIN_ASSETS.footerHighcut, width: 677, height: 183 },
  melon: { src: MAIN_ASSETS.footerMelon, width: 480, height: 127 },
} as const satisfies Record<
  FooterPartnerLogoKey,
  { src: string; width: number; height: number }
>;

/* 후원사 확정 노출 순위 */
const HOME_SPONSOR_LIST = [
  { key: "benuts", file: "benuts.svg", name: "비넛츠", width: 325, height: 232 },
  { key: "sleeplus", file: "sleeplus.svg", name: "Muska(슬립플러스)", width: 519, height: 104 },
  { key: "samtree-chickpea", file: "samtree-chickpea.svg", name: "맛병아리콩", width: 689, height: 202 },
  { key: "binggrae", file: "binggrae.png", name: "빙그레", width: 480, height: 113 },
  { key: "crown-sport", file: "crown-sport.svg", name: "크라운스포츠", width: 938, height: 360 },
  { key: "essenherb", file: "essenherb.png", name: "에센허브", width: 480, height: 100 },
  { key: "halls", file: "halls.svg", name: "호올스(엠지코리아)", width: 1063, height: 419 },
  { key: "happiz", file: "happiz.svg", name: "롯데칠성", width: 1202, height: 478 },
  { key: "nature-valley", file: "nature-valley.svg", name: "네이처밸리 프로틴바", width: 406, height: 116 },
  { key: "ourhome", file: "ourhome.svg", name: "아워홈", width: 797, height: 154 },
  { key: "top", file: "top.svg", name: "TOP 커피", width: 396, height: 274 },
  { key: "lego", file: "lego.png", name: "LEGO", width: 160, height: 160 },
  { key: "fcmm", file: "fcmm.svg", name: "FCMM", width: 124, height: 42 },
  { key: "helinox", file: "helinox.svg", name: "헬리녹스", width: 618, height: 127 },
  { key: "kfc", file: "kfc.png", name: "KFC", width: 480, height: 146 },
] as const;

export const HOME_SPONSORS = HOME_SPONSOR_LIST.map(({ file, ...s }) => ({
  ...s,
  src: `/images/main/sponsors/${file}`,
}));

export const HOME_MELON_LOGO = {
  src: "/images/main/sponsors/melon.png",
  width: 480,
  height: 127,
};

export function footerPartnerLogo(key: FooterPartnerLogoKey) {
  return FOOTER_LOGO[key];
}

export function guideSpecHostsLogoClass(key: FooterPartnerLogoKey) {
  switch (key) {
    case "organizer":
      return "spec__hosts-logo spec__hosts-logo--organizer";
    case "mfriends":
      return "spec__hosts-logo spec__hosts-logo--mfriends";
    case "highcut":
      return "spec__hosts-logo spec__hosts-logo--highcut";
    case "melon":
      return "spec__hosts-logo spec__hosts-logo--melon";
    default:
      return "spec__hosts-logo";
  }
}

export function footerPartnerLogoClass(key: FooterPartnerLogoKey) {
  if (key === "host") {
    return "site-footer__host-logo site-footer__host-logo--host";
  }
  if (key === "organizer") {
    return "site-footer__host-logo site-footer__host-logo--organizer";
  }
  if (key === "mfriends") {
    return "site-footer__host-logo site-footer__host-logo--mfriends";
  }
  if (key === "melon") {
    return "site-footer__host-logo site-footer__host-logo--melon";
  }
  return "site-footer__host-logo";
}
