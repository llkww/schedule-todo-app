import type { ReactNode } from "react";

import { Card } from "./Card";

export function StatCard({
  label,
  value,
  icon,
  hint,
}: {
  label: string;
  value: number | string;
  icon: ReactNode;
  hint?: string;
}) {
  return (
    <Card className="stat-card">
      <div className="stat-card__icon">{icon}</div>
      <div>
        <p className="stat-card__label">{label}</p>
        <strong>{value}</strong>
        {hint ? <span>{hint}</span> : null}
      </div>
    </Card>
  );
}
