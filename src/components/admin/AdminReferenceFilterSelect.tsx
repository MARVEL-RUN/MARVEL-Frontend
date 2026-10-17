"use client";

import { AdminSelect } from "@/components/admin/Select";
import { fetchAdminReferenceFilters } from "@/services/admin/reference-filters";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

type Props = {
  eventId: string;
  value: string;
  onChange: (value: string) => void;
  width?: number;
  disabled?: boolean;
};

export function AdminReferenceFilterSelect({
  eventId,
  value,
  onChange,
  width = 148,
  disabled,
}: Props) {
  const [keyword, setKeyword] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(keyword.trim()), 320);
    return () => window.clearTimeout(timer);
  }, [keyword]);

  const filtersQuery = useQuery({
    queryKey: ["admin", "reference-filters", eventId, debounced],
    queryFn: () =>
      fetchAdminReferenceFilters(eventId, {
        keyword: debounced || undefined,
        size: 100,
      }),
    enabled: Boolean(eventId) && !disabled,
  });

  const options = useMemo(
    () => [
      { value: "", label: "참조필터 전체" },
      ...(filtersQuery.data?.content ?? []).map((filter) => ({
        value: filter.id,
        label: filter.displayName || filter.code || filter.id,
      })),
    ],
    [filtersQuery.data],
  );

  return (
    <div className="admin-ref-filter">
      <AdminSelect
        value={value}
        options={options}
        onChange={onChange}
        ariaLabel="참조필터"
        width={width}
      />
      <input
        className="admin-ref-filter__search"
        type="search"
        value={keyword}
        maxLength={50}
        placeholder="코드 검색"
        aria-label="참조필터 코드 검색"
        disabled={disabled || !eventId}
        onChange={(event) => setKeyword(event.target.value)}
      />
    </div>
  );
}
