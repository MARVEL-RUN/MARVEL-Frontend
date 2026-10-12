"use client";

import { useEffect, useState } from "react";
import {
  countdownSlotsTo,
  isRegistrationRound2Pause,
  registrationRound2OpenAtMs,
} from "@/lib/register-schedule";
import { useIsPreviewPath } from "@/lib/main/useAppBasePath";

export function useRegistrationRound2Pause() {
  const preview = useIsPreviewPath();
  const [pause, setPause] = useState(() => !preview && isRegistrationRound2Pause());

  useEffect(() => {
    if (preview) {
      setPause(false);
      return;
    }
    const tick = () => setPause(isRegistrationRound2Pause());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [preview]);

  return pause;
}

export function useRound2OpenCountdown(enabled: boolean) {
  const target = registrationRound2OpenAtMs();
  const [slots, setSlots] = useState(() =>
    enabled ? countdownSlotsTo(target) : null,
  );

  useEffect(() => {
    if (!enabled) return;
    const tick = () => setSlots(countdownSlotsTo(target));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [enabled, target]);

  return slots;
}
