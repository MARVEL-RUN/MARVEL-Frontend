import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DiscountEntryPage } from "@/components/main/discount/DiscountEntryPage";
import {
  DISCOUNT_LINK_ENTRIES,
  discountLinkEntry,
  isDiscountLinkSlug,
} from "@/lib/discount-link/config";
import { OG_DESCRIPTION, OG_IMAGE, OG_TITLE, SITE_URL } from "@/lib/event";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return DISCOUNT_LINK_ENTRIES.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = discountLinkEntry(slug);
  const title = entry?.title ?? "할인 링크 접수";
  const shareTitle = entry?.shareTitle ?? title;
  return {
    title,
    openGraph: {
      title: shareTitle,
      description: OG_DESCRIPTION,
      url: SITE_URL,
      siteName: "마블런 2026",
      locale: "ko_KR",
      type: "website",
      images: [
        {
          url: OG_IMAGE,
          width: 1024,
          height: 537,
          alt: OG_TITLE,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description: OG_DESCRIPTION,
      images: [OG_IMAGE],
    },
    robots: { index: false, follow: false },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  if (!isDiscountLinkSlug(slug)) notFound();
  return <DiscountEntryPage slug={slug} />;
}
