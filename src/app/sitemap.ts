import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/event";

export const dynamic = "force-static";

const PUBLIC_PATHS = [
  "/",
  "/guide",
  "/kit",
  "/directions",
  "/precautions",
  "/virtual",
  "/register",
  "/lookup",
  "/notices",
  "/faq",
  "/inquiry",
  "/terms",
  "/privacy",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((path) => ({
    url: path === "/" ? SITE_URL : `${SITE_URL}${path}`,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
