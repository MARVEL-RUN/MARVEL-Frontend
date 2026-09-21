import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/event";
import { PREVIEW_BASE_PATH } from "@/lib/preview";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", PREVIEW_BASE_PATH],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
