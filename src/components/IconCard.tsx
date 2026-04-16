"use client";

import { memo } from "react";
import { motion } from "framer-motion";

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
    <motion.div
      className="group relative aspect-square"
      onClick={onSelect && (() => onSelect(icon))}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
      whileHover={{
        scale: 1.12,
        y: -6,
        transition: { type: "spring", stiffness: 400, damping: 20 },
      }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative h-full w-full">
        <img
          src={icon.thumb}
          alt={icon.displayName}
          loading={priority ? "eager" : "lazy"}
          draggable={false}
          className="object-contain w-full h-full"
        />
      </div>

      {/* Name tooltip on hover */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 -bottom-6 text-center"
        initial={{ opacity: 0, y: 4 }}
        whileHover={{ opacity: 1, y: 0 }}
      >
        <span
          className="rounded-full px-2 py-0.5 text-[10px] backdrop-blur-sm text-white"
          style={{ background: "var(--tooltip-bg)" }}
        >
          {icon.displayName}
        </span>
      </motion.div>
    </motion.div>
  );
});

export default IconCard;
