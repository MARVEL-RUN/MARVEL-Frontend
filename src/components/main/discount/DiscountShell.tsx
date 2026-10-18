import type { DiscountLinkEntry } from "@/lib/discount-link/config";

export function DiscountShell({
  entry,
  children,
}: {
  entry?: Pick<DiscountLinkEntry, "slug" | "variant" | "linkCode">;
  children: React.ReactNode;
}) {
  return (
    <main
      className={`page page--discount-entry dl dl--${entry?.variant ?? "standard"}`}
      data-discount-slug={entry?.slug}
      data-link-code={entry?.linkCode}
    >
      <div className="dl__bg" aria-hidden />
      {children}
    </main>
  );
}
