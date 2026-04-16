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
      className="icon-card relative aspect-square"
      onClick={onSelect && (() => onSelect(icon))}
    >
      <img
        src={icon.thumb}
        alt={icon.displayName}
        loading={priority ? "eager" : "lazy"}
        draggable={false}
        className="object-contain w-full h-full"
      />
    </div>
  );
});

export default IconCard;
