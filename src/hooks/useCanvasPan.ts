"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useMotionValue, animate } from "framer-motion";

export function useCanvasPan() {
  const [isDragging, setIsDragging] = useState(false);
  const justDraggedRef = useRef(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    const forceEnd = () => {
      setIsDragging(false);
      justDraggedRef.current = false;
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
  }, [x, y]);

  const snapToOrigin = useCallback(() => {
    if (x.get() !== 0 || y.get() !== 0) {
      animate(x, 0, { type: "spring", stiffness: 400, damping: 40 });
      animate(y, 0, { type: "spring", stiffness: 400, damping: 40 });
    }
  }, [x, y]);

  const dragHandlers = {
    onDragStart: () => {
      x.stop();
      y.stop();
      justDraggedRef.current = false;
      setIsDragging(true);
    },
    onDragEnd: (_: unknown, info: { offset: { x: number; y: number } }) => {
      setIsDragging(false);
      if (Math.abs(info.offset.x) > 3 || Math.abs(info.offset.y) > 3) {
        justDraggedRef.current = true;
        requestAnimationFrame(() => { justDraggedRef.current = false; });
      }
    },
  };

  return { x, y, isDragging, dragHandlers, snapToOrigin, justDraggedRef };
}
