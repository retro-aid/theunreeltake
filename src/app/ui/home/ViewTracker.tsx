'use client';

import { useEffect, useRef } from "react";

export function ViewTracker({ slug }: { slug: string }) {

  const firedFor = useRef<string | null>(null);
    
  useEffect(() => {
    if (firedFor.current === slug) return;
    firedFor.current = slug;
    
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    }).catch(() => {});
  }, [slug]);

  return null;
}