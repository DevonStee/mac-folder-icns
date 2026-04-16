"use client";

import { memo } from "react";

export const ICON_SIZE = 90;

export interface IconMeta {
  slug: string;
  rawSeries: string;
  series: string;
  displayName: string;
  thumb: string;
}

interface IconCardProps {
  icon: IconMeta;
  onSelect?: (icon: IconMeta) => void;
}

const IconCard = memo(function IconCard({ icon, onSelect }: IconCardProps) {
  return (
    <div className="icon-card relative aspect-square" onClick={() => onSelect?.(icon)}>
      <img
        src={icon.thumb}
        alt=""
        width={ICON_SIZE}
        height={ICON_SIZE}
        loading="lazy"
        draggable={false}
        className="object-contain w-full h-full"
      />
    </div>
  );
});

export default IconCard;
