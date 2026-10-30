export const VIRTUAL_RUN_PREFIX = "/virtual-run";

export function isVirtualRunAppPath(pathname: string): boolean {
  return (
    pathname === VIRTUAL_RUN_PREFIX ||
    pathname.startsWith(`${VIRTUAL_RUN_PREFIX}/`)
  );
}

export function isVirtualRunPrefixedPath(pathname: string): boolean {
  return isVirtualRunAppPath(pathname);
}

export function vrPath(href: string, prefixed: boolean): string {
  const normalized = href.startsWith("/") ? href : `/${href}`;

  if (prefixed) {
    if (normalized === "/") return VIRTUAL_RUN_PREFIX;
    if (isVirtualRunAppPath(normalized)) return normalized;
    return `${VIRTUAL_RUN_PREFIX}${normalized}`;
  }

  if (normalized === VIRTUAL_RUN_PREFIX || normalized === `${VIRTUAL_RUN_PREFIX}/`) {
    return "/";
  }
  if (normalized.startsWith(`${VIRTUAL_RUN_PREFIX}/`)) {
    const stripped = normalized.slice(VIRTUAL_RUN_PREFIX.length);
    return stripped || "/";
  }
  return normalized;
}

export function isVirtualRunHomePath(pathname: string): boolean {
  if (pathname === VIRTUAL_RUN_PREFIX || pathname === `${VIRTUAL_RUN_PREFIX}/`) {
    return true;
  }
  if (!isVirtualRunAppPath(pathname)) {
    return pathname === "/" || pathname === "";
  }
  return false;
}
