"use client";

import { useEffect, useState } from "react";
import { EVENT } from "@/lib/event";
import { useIsPreviewPath } from "@/lib/main/useAppBasePath";
import { isRegistrationOpen, registrationForced } from "@/lib/mode";

export function useRegistrationOpen() {
  const preview = useIsPreviewPath();
  const [open, setOpen] = useState(preview || registrationForced === true);

  useEffect(() => {
    if (preview) {
      setOpen(true);
      return;
    }
    setOpen(isRegistrationOpen());
    if (registrationForced !== null) return;
    const remain = Date.parse(EVENT.openAt) - Date.now();
    if (remain <= 0) return;
    const timer = window.setTimeout(
      () => setOpen(isRegistrationOpen()),
      remain + 50,
    );
    return () => window.clearTimeout(timer);
  }, [preview]);

  return preview || open;
}
