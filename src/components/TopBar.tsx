"use client";

import { memo } from "react";
import { ALL_CHIPS, chipLabel } from "./FilterChips";

interface TopBarProps {
  countText: string;
  q: string;
  s: string;
  isDark: boolean;
  themeReady: boolean;
  onThemeToggle: () => void;
  onSearch: (q: string) => void;
  onFilter: (s: string) => void;
}

function IconSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--theme-icon)" }}>
      {children}
    </svg>
  );
}

export default memo(function TopBar({
  countText, q, s, isDark, themeReady, onThemeToggle, onSearch, onFilter,
}: TopBarProps) {
  return (
    <>
      <div className="absolute top-4 inset-x-0 z-20 h-fit" data-capsule-row>
        <div className="flex gap-2 overflow-x-auto px-4 py-2 -my-2 scrollbar-hide">
          <div className="ghost-capsule shrink-0 flex items-center gap-2 rounded-full px-4 py-2">
            <span className="text-sm font-medium tracking-tight" style={{ color: "var(--title-color)" }}>
              Fold Icons
            </span>
            <span className="text-[11px]" style={{ color: "var(--muted-color)" }}>·</span>
            <span className="text-xs" style={{ color: "var(--muted-color)" }}>{countText} icons</span>
          </div>

          <div className="ghost-capsule shrink-0 flex items-center gap-1.5 rounded-full px-3 py-2">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ color: "var(--muted-color)", flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              value={q}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search…"
              className="glass-input w-28 bg-transparent text-xs outline-none"
              style={{ color: "var(--input-color)" }}
            />
          </div>

          <button
            onClick={onThemeToggle}
            title={themeReady ? (isDark ? "Light mode" : "Dark mode") : "Theme"}
            className="ghost-capsule shrink-0 flex h-9 w-9 items-center justify-center rounded-full"
          >
            {themeReady ? (
              isDark ? (
                <IconSvg>
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </IconSvg>
              ) : (
                <IconSvg>
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </IconSvg>
              )
            ) : (
              <IconSvg>
                <circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 0 0 18z" />
              </IconSvg>
            )}
          </button>
        </div>
      </div>

      <div className="absolute top-[60px] inset-x-0 z-20 h-fit" data-capsule-row>
        <div className="flex gap-2 overflow-x-auto px-4 py-2 -my-2 scrollbar-hide">
          {ALL_CHIPS.map((chip) => {
            const isActive = chip === s || (chip === "All" && s === "");
            return (
              <button
                key={chip}
                onClick={() => onFilter(chip === "All" ? "" : chip)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${isActive ? "" : "ghost-capsule"}`}
                style={isActive
                  ? { background: "var(--chip-active-bg)", color: "var(--chip-active-fg)" }
                  : { color: "var(--chip-inactive)" }}
              >
                {chipLabel(chip)}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
});
