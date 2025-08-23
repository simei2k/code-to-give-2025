"use client";
import { useEffect, useState } from "react";

interface LiveCounterProps {
  end: number;
  prefix?: string;
  durationMs?: number;
}

export default function LiveCounter({ end, prefix = "", durationMs = 2000 }: LiveCounterProps) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = Math.ceil(end / (durationMs / 16));
    const interval = setInterval(() => {
      start += step;
      if (start >= end) {
        setValue(end);
        clearInterval(interval);
      } else {
        setValue(start);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [end, durationMs]);

  return (
    <span className="tabular-nums font-bold text-4xl md:text-6xl">
      {prefix}{value.toLocaleString()}
    </span>
  );
}
