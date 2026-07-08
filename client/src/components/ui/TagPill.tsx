import type { HTMLAttributes } from "react";

import { cn } from "../../lib/cn";

type TagPillProps = HTMLAttributes<HTMLSpanElement> & {
  color: string;
  name: string;
};

export function TagPill({ color, name, className, ...props }: TagPillProps) {
  return (
    <span className={cn("tag-pill", className)} {...props}>
      <span className="tag-pill__dot" style={{ backgroundColor: color }} aria-hidden="true" />
      {name}
    </span>
  );
}
