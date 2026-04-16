"use client";

import { memo, useCallback } from "react";

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
  const handleClick = useCallback(() => {
    onSelect?.(icon);
  }, [onSelect, icon]);

  return (
    <div className="icon-card relative aspect-square" onClick={handleClick}>
      <img
        src={icon.thumb}
        alt=""
        loading="lazy"
        draggable={false}
        className="object-contain w-full h-full"
      />
    </div>
  );
});

export default IconCard;
