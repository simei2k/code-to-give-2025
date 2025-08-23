"use client";
import { useEffect, useRef, useState } from "react";

interface LiveCounterProps {
  end: number;
  prefix?: string;
  durationMs?: number;
}

export default function LiveCounter({
  end,
  prefix = "",
  durationMs = 2000,
}: LiveCounterProps) {
  const [value, setValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      {
        threshold: 0.6,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    let current = 0;
    const step = Math.ceil(end / (durationMs / 16));

    const interval = setInterval(() => {
      current += step;
      if (current >= end) {
        setValue(end);
        clearInterval(interval);
      } else {
        setValue(current);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [hasAnimated, end, durationMs]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {value.toLocaleString()}
    </span>
  );
}
