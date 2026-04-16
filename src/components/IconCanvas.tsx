"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useTransition,
  useMemo,
  memo,
} from "react";
import { motion, useMotionValue, animate, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ALL_CHIPS, chipLabel } from "./FilterChips";
import IconCard, { type IconMeta } from "./IconCard";

const VERSION_RE = /^v\d+$/;
const HEX_RE = /^[0-9a-f]{6}$/i;

const CELL = 110;
const ICON_SIZE = 90;
const BUFFER = 3;

const GITHUB_RAW = "https://raw.githubusercontent.com/DevonStee/mac-folder-icns/main/public";
const getPreviewSrc = (slug: string) => `${GITHUB_RAW}/previews/${slug}.png`;
const getIcnsSrc = (slug: string) => `${GITHUB_RAW}/icns/${slug}.icns`;


function matchesSeries(icon: IconMeta, activeSeries: string): boolean {
  if (!activeSeries) return true;
  if (activeSeries === "color") return HEX_RE.test(icon.rawSeries);
  if (activeSeries === "archive") return VERSION_RE.test(icon.rawSeries);
  return icon.rawSeries === activeSeries;
}

interface Cell {
  key: string;
  iconIndex: number;
  left: number;
  top: number;
}

const TileCell = memo(function TileCell({
  icon,
  left,
  top,
  onSelect,
}: {
  icon: IconMeta;
  left: number;
  top: number;
  onSelect: (icon: IconMeta) => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: ICON_SIZE,
        height: ICON_SIZE,
      }}
    >
      <IconCard icon={icon} onSelect={onSelect} />
    </div>
  );
});

interface IconCanvasProps {
  icons: IconMeta[];
}

export default function IconCanvas({ icons }: IconCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const justDraggedRef = useRef(false);

  // ── Download dialog ────────────────────────────────────────────────────────
  const [selectedIcon, setSelectedIcon] = useState<IconMeta | null>(null);

  const handleSelect = useCallback((icon: IconMeta) => {
    if (justDraggedRef.current) return;
    setSelectedIcon(icon);
  }, []);

  // ── Theme ─────────────────────────────────────────────────────────────────
  // In a static export the server can't know the user's theme. We set the real
  // theme on <html> via a pre-hydration <head> script (see app/layout.tsx),
  // then sync React state after mount.
  const [isDark, setIsDark] = useState(false);
  const [themeReady, setThemeReady] = useState(false);
  useEffect(() => {
    const theme = document.documentElement.dataset.theme;
    setIsDark(theme === "dark");
    setThemeReady(true);
  }, []);
  useEffect(() => {
    if (!themeReady) return;
    const next = isDark ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // ignore
    }
  }, [isDark, themeReady]);

  // ── URL params ─────────────────────────────────────────────────────────────
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
        router.replace(p.toString() ? `?${p.toString()}` : "/", {
          scroll: false,
        });
      });
    },
    [router],
  );

  // ── Pan motion values ──────────────────────────────────────────────────────
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // ── Mobile/touch robustness ────────────────────────────────────────────────
  // On some touch browsers a drag can end via pointercancel/blur/visibilitychange,
  // which may prevent onDragEnd from firing and leave the UI feeling "stuck".
  useEffect(() => {
    const forceEndDrag = () => {
      setIsDragging(false);
      justDraggedRef.current = false;
      x.stop();
      y.stop();
    };

    window.addEventListener("pointerup", forceEndDrag);
    window.addEventListener("pointercancel", forceEndDrag);
    window.addEventListener("blur", forceEndDrag);

    const onVis = () => {
      if (document.hidden) forceEndDrag();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.removeEventListener("pointerup", forceEndDrag);
      window.removeEventListener("pointercancel", forceEndDrag);
      window.removeEventListener("blur", forceEndDrag);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [x, y]);

  // ── Viewport size ──────────────────────────────────────────────────────────
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

  // ── Filtered icons ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return icons.filter((icon) => {
      const matchQ =
        !query ||
        icon.slug.toLowerCase().includes(query) ||
        icon.displayName.toLowerCase().includes(query) ||
        icon.rawSeries.toLowerCase().includes(query);
      return matchQ && matchesSeries(icon, s);
    });
  }, [icons, q, s]);

  const filteredRef = useRef(filtered);
  filteredRef.current = filtered;

  // ── Virtual cell computation ───────────────────────────────────────────────
  // Reads from refs so computeCells identity stays stable (only x/y as deps),
  // avoiding unnecessary re-subscriptions of the x/y change listener.
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
        cells.push({
          key: `${row},${col}`,
          iconIndex,
          left: col * CELL,
          top: row * CELL,
        });
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
    return () => {
      unsubX();
      unsubY();
    };
  }, [x, y, computeCells]);

  useEffect(() => {
    lastTileRef.current = { col: 999999, row: 999999 };
    setCells(computeCells());
  }, [filtered, vpSize, computeCells]);

  // ── Wheel → pan ────────────────────────────────────────────────────────────
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const onWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest("[data-capsule-row]")) return;
      e.preventDefault();
      x.set(x.get() - e.deltaX);
      y.set(y.get() - e.deltaY);
    };
    wrapper.addEventListener("wheel", onWheel, { passive: false });
    return () => wrapper.removeEventListener("wheel", onWheel);
  }, [x, y]);

  // ── Snap on filter/search change ───────────────────────────────────────────
  useEffect(() => {
    if (x.get() !== 0 || y.get() !== 0) {
      animate(x, 0, { type: "spring", stiffness: 400, damping: 40 });
      animate(y, 0, { type: "spring", stiffness: 400, damping: 40 });
    }
  }, [q, s, x, y]);

  const countText =
    filtered.length !== icons.length
      ? `${filtered.length} of ${icons.length}`
      : `${icons.length}`;

  // ── Render ─────────────────────────────────────────────────────────────────
  // All colours come from CSS variables defined in globals.css.
  // Toggling data-theme switches the entire palette in one attribute change.
  return (
    <div
      ref={wrapperRef}
      className={`fixed inset-0 overflow-hidden select-none transition-colors duration-300 ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      style={{ background: "var(--page-bg)" }}
    >
      {/* ── Infinite tiling canvas ── */}
      <motion.div
        drag
        // Momentum can feel like the canvas is "unresponsive" to the next touch on some devices.
        // Disabling keeps repeated touch drags consistently smooth.
        dragMomentum={false}
        dragTransition={{ power: 0.25, timeConstant: 300, restDelta: 1 }}
        style={{ x, y, touchAction: "none" }}
        onDragStart={() => {
          x.stop();
          y.stop();
          justDraggedRef.current = false;
          setIsDragging(true);
        }}
        onDragEnd={(_, info) => {
          setIsDragging(false);
          if (Math.abs(info.offset.x) > 3 || Math.abs(info.offset.y) > 3) {
            justDraggedRef.current = true;
            requestAnimationFrame(() => {
              justDraggedRef.current = false;
            });
          }
        }}
        className="absolute inset-0"
      >
        <div className={isDragging ? "pointer-events-none" : ""}>
          {cells.map((cell) => {
            const icon = filtered[cell.iconIndex];
            if (!icon) return null;
            return (
              <TileCell
                key={cell.key}
                icon={icon}
                left={cell.left}
                top={cell.top}
                onSelect={handleSelect}
              />
            );
          })}
        </div>
      </motion.div>

      {/* ── Row 1: title + search + theme ── */}
      <div className="absolute top-4 inset-x-0 z-20 h-fit" data-capsule-row>
        <div className="flex gap-2 overflow-x-auto px-4 py-2 -my-2 scrollbar-hide">
          {/* Title capsule */}
          <div className="ghost-capsule shrink-0 flex items-center gap-2 rounded-full px-4 py-2">
            <span
              className="text-sm font-medium tracking-tight"
              style={{ color: "var(--title-color)" }}
            >
              Fold Icons
            </span>
            <span
              className="text-[11px]"
              style={{ color: "var(--muted-color)" }}
            >
              ·
            </span>
            <span className="text-xs" style={{ color: "var(--muted-color)" }}>
              {countText} icons
            </span>
          </div>

          {/* Search capsule */}
          <div className="ghost-capsule shrink-0 flex items-center gap-1.5 rounded-full px-3 py-2">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--muted-color)", flexShrink: 0 }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              value={q}
              onChange={(e) => updateParams(e.target.value, s)}
              placeholder="Search…"
              className="glass-input w-28 bg-transparent text-xs outline-none"
              style={{ color: "var(--input-color)" }}
            />
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setIsDark((d) => !d)}
            title={
              themeReady ? (isDark ? "Light mode" : "Dark mode") : "Theme"
            }
            className="ghost-capsule shrink-0 flex h-9 w-9 items-center justify-center rounded-full"
          >
            {themeReady ? (
              isDark ? (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: "var(--theme-icon)" }}
                >
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: "var(--theme-icon)" }}
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "var(--theme-icon)" }}
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3a9 9 0 0 0 0 18z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Download dialog ── */}
      <AnimatePresence>
        {selectedIcon && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center"
            data-capsule-row
            style={{ background: "rgba(0,0,0,0.36)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setSelectedIcon(null)}
          >
            <motion.div
              className="ghost-capsule rounded-3xl p-6 flex flex-col items-center gap-4"
              style={{ width: 240 }}
              initial={{ scale: 0.82, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.82, opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Preview */}
              <div className="relative w-24 h-24">
                <Image
                  src={getPreviewSrc(selectedIcon.slug)}
                  alt={selectedIcon.displayName}
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>

              {/* Name + series */}
              <div className="text-center">
                <p
                  className="text-sm font-medium leading-snug"
                  style={{ color: "var(--title-color)" }}
                >
                  {selectedIcon.displayName}
                </p>
                <p
                  className="text-[11px] mt-0.5"
                  style={{ color: "var(--muted-color)" }}
                >
                  {selectedIcon.series}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => setSelectedIcon(null)}
                  className="ghost-capsule flex-1 py-2 rounded-full text-xs font-medium cursor-pointer"
                  style={{ color: "var(--chip-inactive)" }}
                >
                  Cancel
                </button>
                <a
                  href={getIcnsSrc(selectedIcon.slug)}
                  download={`${selectedIcon.slug}.icns`}
                  className="flex-1 py-2 rounded-full text-xs font-medium text-center"
                  style={{
                    background: "var(--chip-active-bg)",
                    color: "var(--chip-active-fg)",
                  }}
                  onClick={() => setSelectedIcon(null)}
                >
                  Download
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Row 2: filter chips ── */}
      <div className="absolute top-[60px] inset-x-0 z-20 h-fit" data-capsule-row>
        <div className="flex gap-2 overflow-x-auto px-4 py-2 -my-2 scrollbar-hide">
          {ALL_CHIPS.map((chip) => {
            const isActive = chip === s || (chip === "All" && s === "");
            return (
              <button
                key={chip}
                onClick={() => updateParams(q, chip === "All" ? "" : chip)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                  isActive ? "" : "ghost-capsule"
                }`}
                style={
                  isActive
                    ? {
                        background: "var(--chip-active-bg)",
                        color: "var(--chip-active-fg)",
                      }
                    : { color: "var(--chip-inactive)" }
                }
              >
                {chipLabel(chip)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
