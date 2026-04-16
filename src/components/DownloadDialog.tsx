"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { IconMeta } from "./IconCard";

const GITHUB_RAW = process.env.NEXT_PUBLIC_GITHUB_RAW!;

interface DownloadDialogProps {
  icon: IconMeta | null;
  onClose: () => void;
}

export default function DownloadDialog({ icon, onClose }: DownloadDialogProps) {
  const [imgState, setImgState] = useState<"loading" | "loaded" | "error">("loading");

  const previewSrc = icon ? `${GITHUB_RAW}/previews/${icon.slug}.png` : "";
  const icnsSrc = icon ? `${GITHUB_RAW}/icns/${icon.slug}.icns` : "";

  return (
    <AnimatePresence>
      {icon && (
        <motion.div
          className="absolute inset-0 z-50 flex items-center justify-center"
          data-capsule-row
          style={{ background: "rgba(0,0,0,0.36)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
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
            {/* Preview image with loading/error state */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              {imgState === "loading" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: "var(--muted-color)", borderTopColor: "transparent" }}
                  />
                </div>
              )}
              {imgState === "error" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <img src={icon.thumb} alt={icon.displayName} className="w-full h-full object-contain opacity-60" />
                </div>
              )}
              <img
                key={previewSrc}
                src={previewSrc}
                alt={icon.displayName}
                className="w-full h-full object-contain"
                style={{ opacity: imgState === "loaded" ? 1 : 0, transition: "opacity 150ms ease" }}
                onLoad={() => setImgState("loaded")}
                onError={() => setImgState("error")}
              />
            </div>

            {/* Name + series */}
            <div className="text-center">
              <p className="text-sm font-medium leading-snug" style={{ color: "var(--title-color)" }}>
                {icon.displayName}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--muted-color)" }}>
                {icon.series}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 w-full">
              <button
                onClick={onClose}
                className="ghost-capsule flex-1 py-2 rounded-full text-xs font-medium cursor-pointer"
                style={{ color: "var(--chip-inactive)" }}
              >
                Cancel
              </button>
              <a
                href={icnsSrc}
                download={`${icon.slug}.icns`}
                className="flex-1 py-2 rounded-full text-xs font-medium text-center"
                style={{ background: "var(--chip-active-bg)", color: "var(--chip-active-fg)" }}
                onClick={onClose}
              >
                Download
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
