import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

export function CalendarCell({
  day,
  muted,
  today,
  selected,
  count,
  onClick,
  children,
}: {
  day: number;
  muted?: boolean;
  today?: boolean;
  selected?: boolean;
  count?: number;
  onClick?: () => void;
  children?: ReactNode;
}) {
  return (
    <button
      className={cn(
        "calendar-cell",
        muted && "calendar-cell--muted",
        today && "calendar-cell--today",
        selected && "calendar-cell--selected",
      )}
      onClick={onClick}
      type="button"
    >
      <span>{day}</span>
      {count ? <strong>{count}</strong> : null}
      {children}
    </button>
  );
}
