"use client";

import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function useUrlParams() {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const q = params.get("q") ?? "";
  const s = params.get("s") ?? "";

  const updateParams = useCallback(
    (nextQ: string, nextS: string) => {
      const p = new URLSearchParams();
      if (nextQ) p.set("q", nextQ);
      if (nextS) p.set("s", nextS);
      startTransition(() => {
        router.replace(p.toString() ? `?${p.toString()}` : "/", { scroll: false });
      });
    },
    [router],
  );

  return { q, s, updateParams };
}
