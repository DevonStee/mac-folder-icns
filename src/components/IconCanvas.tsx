"use client";

import { useRef, useState, useEffect, useCallback, useMemo, memo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useCanvasPan } from "@/hooks/useCanvasPan";
import { useVirtualCells } from "@/hooks/useVirtualCells";
import IconCard, { type IconMeta } from "./IconCard";
import TopBar from "./TopBar";
import DownloadDialog from "./DownloadDialog";

const VERSION_RE = /^v\d+$/;
const HEX_RE = /^[0-9a-f]{6}$/i;
const CELL = 110;
const ICON_SIZE = 90;

function matchesSeries(icon: IconMeta, activeSeries: string): boolean {
  if (!activeSeries) return true;
  if (activeSeries === "color") return HEX_RE.test(icon.rawSeries);
  if (activeSeries === "archive") return VERSION_RE.test(icon.rawSeries);
  return icon.rawSeries === activeSeries;
}

const TileCell = memo(function TileCell({
  icon, left, top, onSelect,
}: {
  icon: IconMeta; left: number; top: number; onSelect: (icon: IconMeta) => void;
}) {
  return (
    <div style={{ position: "absolute", left, top, width: ICON_SIZE, height: ICON_SIZE }}>
      <IconCard icon={icon} onSelect={onSelect} />
    </div>
  );
});

export default function IconCanvas({ icons }: { icons: IconMeta[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { isDark, setIsDark, themeReady } = useTheme();
  const { q, s, updateParams } = useUrlParams();
  const { x, y, isDragging, dragHandlers, snapToOrigin } = useCanvasPan();
  const [selectedIcon, setSelectedIcon] = useState<IconMeta | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return icons.filter((icon) => {
      const matchQ = !query
        || icon.slug.toLowerCase().includes(query)
        || icon.displayName.toLowerCase().includes(query)
        || icon.rawSeries.toLowerCase().includes(query);
      return matchQ && matchesSeries(icon, s);
    });
  }, [icons, q, s]);

  const cells = useVirtualCells(filtered, x, y);

  useEffect(() => { snapToOrigin(q, s); }, [q, s, snapToOrigin]);

  // Wheel → pan
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

  const handleSelect = useCallback((icon: IconMeta) => {
    setSelectedIcon(icon);
  }, []);

  const countText = filtered.length !== icons.length
    ? `${filtered.length} of ${icons.length}`
    : `${icons.length}`;

  return (
    <div
      ref={wrapperRef}
      className={`fixed inset-0 overflow-hidden select-none transition-colors duration-300 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{ background: "var(--page-bg)" }}
    >
      {/* Infinite tiling canvas */}
      <motion.div
        drag
        dragMomentum={false}
        dragTransition={{ power: 0.25, timeConstant: 300, restDelta: 1 }}
        style={{ x, y, touchAction: "none" }}
        {...dragHandlers}
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

      <TopBar
        countText={countText}
        q={q}
        s={s}
        isDark={isDark}
        themeReady={themeReady}
        onThemeToggle={() => setIsDark((d) => !d)}
        onSearch={(nextQ) => updateParams(nextQ, s)}
        onFilter={(nextS) => updateParams(q, nextS)}
      />

      <DownloadDialog icon={selectedIcon} onClose={() => setSelectedIcon(null)} />
    </div>
  );
}
