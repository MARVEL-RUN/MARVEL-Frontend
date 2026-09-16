"use client";

import { useEffect, useState } from "react";
import { EVENT } from "@/lib/event";
import { isRegistrationOpen, registrationForced } from "@/lib/mode";

export function useRegistrationOpen() {
  const [open, setOpen] = useState(registrationForced === true);

  useEffect(() => {
    setOpen(isRegistrationOpen());
    if (registrationForced !== null) return;
    const remain = Date.parse(EVENT.openAt) - Date.now();
    if (remain <= 0) return;
    const timer = window.setTimeout(
      () => setOpen(isRegistrationOpen()),
      remain + 50,
    );
    return () => window.clearTimeout(timer);
  }, []);

  return open;
}
