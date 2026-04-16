"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type { MotionValue } from "framer-motion";
import type { IconMeta } from "@/components/IconCard";

const CELL = 110;
const BUFFER = 3;

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
  const vpSizeRef = useRef({ w: 0, h: 0 });
  const [vpSize, setVpSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const update = () => {
      const size = { w: window.innerWidth, h: window.innerHeight };
      vpSizeRef.current = size;
      setVpSize(size);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

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

  useEffect(() => {
    const check = () => {
      const tc = Math.floor(-x.get() / CELL);
      const tr = Math.floor(-y.get() / CELL);
      if (tc !== lastTileRef.current.col || tr !== lastTileRef.current.row) {
        lastTileRef.current = { col: tc, row: tr };
        setCells(computeCells());
      }
    };
    const unsubX = x.on("change", check);
    const unsubY = y.on("change", check);
    check();
    return () => { unsubX(); unsubY(); };
  }, [x, y, computeCells]);

  useEffect(() => {
    lastTileRef.current = { col: 999999, row: 999999 };
    setCells(computeCells());
  }, [filtered, vpSize, computeCells]);

  return cells;
}
