const DEFAULT_GA_PROPERTY_ID = "553380640";

export function gaRealtimeOverviewUrl(propertyId = process.env.GA_PROPERTY_ID) {
  const id = (propertyId || DEFAULT_GA_PROPERTY_ID).replace(/\D/g, "");
  if (!id) return "";
  return `https://analytics.google.com/analytics/web/#/p${id}/realtime/overview`;
}

export const NAVER_ANALYTICS_URL = "https://analytics.naver.com/";
