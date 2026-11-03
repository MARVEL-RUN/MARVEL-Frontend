import { isVirtualRunNavGroup, type VirtualRunNavItem } from "./nav";
import { vrPath } from "./href";

export function hrefPath(href: string): string {
  return href.split("#")[0];
}

export function vrNavChildActive(
  pathname: string,
  prefixed: boolean,
  childHref: string,
  parentHref: string,
  hash = "",
): boolean {
  const id = childHref.split("#")[1];
  if (id) {
    const parent = vrPath(hrefPath(parentHref), prefixed);
    return pathname.startsWith(parent) && hash === `#${id}`;
  }
  const child = vrPath(hrefPath(childHref), prefixed);
  const parent = vrPath(hrefPath(parentHref), prefixed);
  if (child === parent) {
    return pathname === parent || pathname === `${parent}/`;
  }
  return pathname === child || pathname.startsWith(`${child}/`);
}

export function vrNavItemActive(
  pathname: string,
  prefixed: boolean,
  item: VirtualRunNavItem,
  hash = "",
): boolean {
  const root = vrPath(item.href, prefixed);
  if (item.href === "/") {
    return pathname === root || pathname === `${root}/`;
  }
  if (pathname === root || pathname.startsWith(`${root}/`)) return true;
  if (!isVirtualRunNavGroup(item)) return false;
  return item.children.some((child) =>
    vrNavChildActive(pathname, prefixed, child.href, item.href, hash),
  );
}
