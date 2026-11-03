"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isVirtualRunPrefixedPath, vrPath } from "@/lib/virtual-run/href";

type VrLinkProps = Omit<React.ComponentProps<typeof Link>, "href"> & {
  href: string;
};

export function VrLink({ href, ...rest }: VrLinkProps) {
  const toHref = useVrPath();
  return <Link href={toHref(href)} {...rest} />;
}

/** router.push 용 — `/virtual-run` 접두 여부 맞춤 */
export function useVrPath(): (href: string) => string {
  const pathname = usePathname();
  const prefixed = isVirtualRunPrefixedPath(pathname);
  return (href: string) => vrPath(href, prefixed);
}
