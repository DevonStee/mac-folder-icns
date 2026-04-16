"use client";

import { useRef, useState, useEffect, useCallback, useTransition } from "react";
import type { MotionValue } from "framer-motion";
import type { IconMeta } from "@/components/IconCard";

export const CELL = 110;
const BUFFER = 0;

export interface Cell {
  key: string;
  iconIndex: number;
  left: number;
  top: number;
}

export function useVirtualCells(
  filtered: IconMeta[],
  x: MotionValue<number>,
  y: MotionValue<number>,
) {
  const [, startTransition] = useTransition();
  const vpSizeRef = useRef({ w: 0, h: 0 });
  const filteredRef = useRef(filtered);
  filteredRef.current = filtered;

  const computeCells = useCallback((): Cell[] => {
    const N = filteredRef.current.length;
    const { w, h } = vpSizeRef.current;
    if (N === 0 || w === 0) return [];
    const COLS = Math.max(1, Math.floor(w / CELL));
    const panX = x.get();
    const panY = y.get();
    const startCol = Math.floor(-panX / CELL) - BUFFER;
    const endCol = startCol + Math.ceil(w / CELL) + BUFFER * 2 + 1;
    const startRow = Math.floor(-panY / CELL) - BUFFER;
    const endRow = startRow + Math.ceil(h / CELL) + BUFFER * 2 + 1;
    const cells: Cell[] = [];
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const iconIndex = (((row * COLS + col) % N) + N) % N;
        cells.push({ key: `${row},${col}`, iconIndex, left: col * CELL, top: row * CELL });
      }
    }
    return cells;
  }, [x, y]);

  const [cells, setCells] = useState<Cell[]>([]);
  const lastTileRef = useRef({ col: 999999, row: 999999 });

  // Recompute on pan — deferred so drag animation stays smooth
  useEffect(() => {
    const check = () => {
      const tc = Math.floor(-x.get() / CELL);
      const tr = Math.floor(-y.get() / CELL);
      if (tc !== lastTileRef.current.col || tr !== lastTileRef.current.row) {
        lastTileRef.current = { col: tc, row: tr };
        startTransition(() => setCells(computeCells()));
      }
    };
    const unsubX = x.on("change", check);
    const unsubY = y.on("change", check);
    check();
    return () => { unsubX(); unsubY(); };
  }, [x, y, computeCells, startTransition]);

  // Recompute on filter change or resize
  useEffect(() => {
    const recompute = () => {
      vpSizeRef.current = { w: window.innerWidth, h: window.innerHeight };
      lastTileRef.current = { col: 999999, row: 999999 };
      startTransition(() => setCells(computeCells()));
    };
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [filtered, computeCells, startTransition]);

  return cells;
}
