import { Loader2 } from "lucide-react";

export function LoadingSpinner({ label = "加载中" }: { label?: string }) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <Loader2 className="spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <div className="skeleton-list" aria-label="正在加载内容">
      {Array.from({ length: rows }).map((_, index) => (
        <div className="skeleton-card" key={index}>
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}
