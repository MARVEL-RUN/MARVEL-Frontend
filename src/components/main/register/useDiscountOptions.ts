"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_EVENT_ID, hasMainApi } from "@/lib/main/config";
import { MainHttpError, isServerDownError } from "@/lib/main/fetch";
import type { DiscountOptions } from "@/lib/discount-link/types";
import { fetchDiscountOptions } from "@/services/main/discount-options";

export function useDiscountOptions(linkCode: string) {
  const [options, setOptions] = useState<DiscountOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorCode, setErrorCode] = useState<string | undefined>();
  const [down, setDown] = useState(false);
  const [tick, setTick] = useState(0);

  const retry = useCallback(() => {
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    const code = linkCode.trim();
    if (!hasMainApi) {
      setLoading(false);
      setDown(false);
      setErrorMessage("API 주소가 설정되지 않았습니다.");
      return;
    }
    if (!code) {
      setLoading(false);
      setErrorMessage("할인 링크 코드가 없습니다.");
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchDiscountOptions(DEFAULT_EVENT_ID, code)
      .then((data) => {
        if (cancelled) return;
        setOptions(data);
        setErrorMessage("");
        setErrorCode(undefined);
        setDown(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setOptions(null);
        setDown(isServerDownError(err));
        setErrorCode(err instanceof MainHttpError ? err.code : undefined);
        setErrorMessage(
          err instanceof MainHttpError
            ? err.message
            : "할인 안내를 불러오지 못했습니다.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [linkCode, tick]);

  return {
    options,
    loading,
    errorMessage,
    errorCode,
    down,
    retry,
  };
}
