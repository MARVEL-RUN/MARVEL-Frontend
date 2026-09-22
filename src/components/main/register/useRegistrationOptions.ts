"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_EVENT_ID, hasMainApi } from "@/lib/main/config";
import { MainHttpError, isServerDownError } from "@/lib/main/fetch";
import { sortedCategories } from "@/lib/registration-options";
import { fetchRegistrationOptions } from "@/services/main/registration-options";
import type { RegistrationCategory } from "@/services/main/types";

export function useRegistrationOptions() {
  const [categories, setCategories] = useState<RegistrationCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [down, setDown] = useState(false);
  const [tick, setTick] = useState(0);

  const retry = useCallback(() => {
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!hasMainApi) {
      setLoading(false);
      setDown(false);
      setErrorMessage("API 주소가 설정되지 않았습니다.");
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchRegistrationOptions(DEFAULT_EVENT_ID)
      .then((data) => {
        if (cancelled) return;
        setCategories(sortedCategories(data.categories ?? []));
        setErrorMessage("");
        setDown(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setCategories([]);
        setDown(isServerDownError(err));
        setErrorMessage(
          err instanceof MainHttpError
            ? err.message
            : "신청 옵션을 불러오지 못했습니다.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tick]);

  return {
    categories,
    loading,
    errorMessage,
    down,
    retry,
  };
}
