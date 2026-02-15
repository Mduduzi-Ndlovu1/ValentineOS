"use client";

import { useState, useEffect } from "react";
import { calculateUptime, RELATIONSHIP_START_DATE, type Uptime } from "@/store/atoms/settings";

export function useUptime(): Uptime {
  const [uptime, setUptime] = useState<Uptime>(() => calculateUptime(RELATIONSHIP_START_DATE));

  useEffect(() => {
    const interval = setInterval(() => {
      setUptime(calculateUptime(RELATIONSHIP_START_DATE));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return uptime;
}
