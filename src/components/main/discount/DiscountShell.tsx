import type { DiscountLinkEntry } from "@/lib/discount-link/config";

export function DiscountShell({
  entry,
  booting,
  children,
}: {
  entry?: Pick<DiscountLinkEntry, "slug" | "variant" | "linkCode">;
  booting?: boolean;
  children: React.ReactNode;
}) {
  return (
    <main
      className={[
        "page page--discount-entry dl",
        entry ? `dl--${entry.variant}` : "dl--standard",
        booting ? "is-booting" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-discount-slug={entry?.slug}
      data-link-code={entry?.linkCode}
    >
      <div className="dl__bg" aria-hidden />
      {children}
    </main>
  );
}
