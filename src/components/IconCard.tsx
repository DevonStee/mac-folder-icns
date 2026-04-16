"use client";

import { memo } from "react";

export interface IconMeta {
  slug: string;
  rawSeries: string;
  series: string;
  displayName: string;
  thumb: string;
}

interface IconCardProps {
  icon: IconMeta;
  priority?: boolean;
  onSelect?: (icon: IconMeta) => void;
}

const IconCard = memo(function IconCard({ icon, priority, onSelect }: IconCardProps) {
  return (
    <div
      className="icon-card group relative aspect-square"
      onClick={onSelect && (() => onSelect(icon))}
    >
      <img
        src={icon.thumb}
        alt={icon.displayName}
        loading={priority ? "eager" : "lazy"}
        draggable={false}
        className="object-contain w-full h-full"
      />

      {/* Name tooltip on hover */}
      <div className="icon-tooltip pointer-events-none absolute inset-x-0 -bottom-6 text-center">
        <span
          className="rounded-full px-2 py-0.5 text-[10px] backdrop-blur-sm text-white"
          style={{ background: "var(--tooltip-bg)" }}
        >
          {icon.displayName}
        </span>
      </div>
    </div>
  );
});

export default IconCard;
