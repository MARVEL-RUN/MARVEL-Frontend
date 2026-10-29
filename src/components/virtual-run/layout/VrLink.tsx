"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isVirtualRunPrefixedPath, vrPath } from "@/lib/virtual-run/href";

type VrLinkProps = Omit<React.ComponentProps<typeof Link>, "href"> & {
  href: string;
};

export function VrLink({ href, ...rest }: VrLinkProps) {
  const pathname = usePathname();
  const prefixed = isVirtualRunPrefixedPath(pathname);
  return <Link href={vrPath(href, prefixed)} {...rest} />;
}
