"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useMotionValue, animate } from "framer-motion";

export function useCanvasPan() {
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    const forceEnd = () => {
      setIsDragging(false);
      x.stop();
      y.stop();
    };
    window.addEventListener("pointerup", forceEnd);
    window.addEventListener("pointercancel", forceEnd);
    window.addEventListener("blur", forceEnd);
    const onVis = () => { if (document.hidden) forceEnd(); };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("pointerup", forceEnd);
      window.removeEventListener("pointercancel", forceEnd);
      window.removeEventListener("blur", forceEnd);
      document.removeEventListener("visibilitychange", onVis);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const snapToOrigin = useCallback(() => {
    if (x.get() !== 0 || y.get() !== 0) {
      animate(x, 0, { type: "spring", stiffness: 400, damping: 40 });
      animate(y, 0, { type: "spring", stiffness: 400, damping: 40 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dragHandlers = useMemo(() => ({
    onDragStart: () => {
      x.stop();
      y.stop();
      setIsDragging(true);
    },
    onDragEnd: (_: unknown, info: { offset: { x: number; y: number } }) => {
      setIsDragging(false);
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  return { x, y, isDragging, dragHandlers, snapToOrigin };
}
