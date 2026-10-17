import { adminFetch } from "@/lib/admin/fetch";

export type AdminReferenceFilter = {
  id: string;
  code: string;
  displayName: string;
  priority: number;
  sortOrder: number;
};

type ReferenceFilterPage = {
  content: AdminReferenceFilter[];
  totalElements: number;
};

function asText(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function normalizeFilter(raw: unknown): AdminReferenceFilter | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const row = raw as Record<string, unknown>;
  const id = asText(row.id);
  if (!id) return null;
  return {
    id,
    code: asText(row.code),
    displayName: asText(row.displayName) || asText(row.code),
    priority: typeof row.priority === "number" ? row.priority : 0,
    sortOrder: typeof row.sortOrder === "number" ? row.sortOrder : 0,
  };
}

function sortFilters(list: AdminReferenceFilter[]) {
  return [...list].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    if (a.code !== b.code) return a.code.localeCompare(b.code, "ko");
    return a.id.localeCompare(b.id, "ko");
  });
}

function asFilterPage(data: unknown): ReferenceFilterPage {
  if (Array.isArray(data)) {
    const content = sortFilters(
      data.flatMap((item) => {
        const row = normalizeFilter(item);
        return row ? [row] : [];
      }),
    );
    return { content, totalElements: content.length };
  }
  if (data && typeof data === "object" && Array.isArray((data as ReferenceFilterPage).content)) {
    const page = data as ReferenceFilterPage;
    return {
      content: sortFilters(
        page.content.flatMap((item) => {
          const row = normalizeFilter(item);
          return row ? [row] : [];
        }),
      ),
      totalElements: page.totalElements ?? page.content.length,
    };
  }
  return { content: [], totalElements: 0 };
}

export type ReferenceFilterQuery = {
  keyword?: string;
  maxPriority?: number;
  page?: number;
  size?: number;
};

export function fetchAdminReferenceFilters(
  eventId: string,
  params: ReferenceFilterQuery = {},
) {
  const query = new URLSearchParams();
  if (params.keyword?.trim()) query.set("keyword", params.keyword.trim());
  if (params.maxPriority != null && params.maxPriority >= 0) {
    query.set("maxPriority", String(params.maxPriority));
  }
  query.set("page", String(params.page ?? 0));
  query.set("size", String(Math.min(100, Math.max(1, params.size ?? 50))));

  const qs = query.toString();
  return adminFetch<unknown>(
    `v1/admin/events/${encodeURIComponent(eventId)}/reference-filters${qs ? `?${qs}` : ""}`,
  ).then(asFilterPage);
}
