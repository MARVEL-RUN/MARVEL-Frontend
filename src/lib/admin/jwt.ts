import { ADMIN_ROLES } from "@/types/admin";

export function decodeToken(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function normalizeRole(role: unknown): string | null {
  if (typeof role !== "string" || !role.trim()) return null;
  return role.toUpperCase().replace(/^ROLE_/i, "");
}

export function extractRoles(decoded: Record<string, unknown> | null): string[] {
  if (!decoded) return [];
  const raw: unknown[] = [];

  if (Array.isArray(decoded.role)) raw.push(...decoded.role);
  else if (typeof decoded.role === "string") raw.push(decoded.role);

  if (Array.isArray(decoded.roles)) raw.push(...decoded.roles);

  const names = raw
    .map((item) =>
      typeof item === "string"
        ? normalizeRole(item)
        : normalizeRole((item as { authority?: string })?.authority),
    )
    .filter((name): name is string => Boolean(name));

  return Array.from(new Set(names));
}

export function isAllowedAdminRole(roles: string[]) {
  return roles.some(
    (role) =>
      ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number]) ||
      role.includes("ADMIN"),
  );
}
