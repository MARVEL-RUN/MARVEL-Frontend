/** 할인 전용 path(`/discount/*`). `1`일 때만 켬 */
export const hasDiscountLinkFeature =
  process.env.NEXT_PUBLIC_DISCOUNT_LINK === "1";
