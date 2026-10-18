import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DiscountEntryPage } from "@/components/main/discount/DiscountEntryPage";
import {
  DISCOUNT_LINK_ENTRIES,
  discountLinkEntry,
  isDiscountLinkSlug,
} from "@/lib/discount-link/config";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return DISCOUNT_LINK_ENTRIES.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = discountLinkEntry(slug);
  return {
    title: entry?.title ?? "할인 링크 접수",
    robots: { index: false, follow: false },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  if (!isDiscountLinkSlug(slug)) notFound();
  return <DiscountEntryPage slug={slug} />;
}
