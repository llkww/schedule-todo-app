import type { ReactNode } from "react";
import { CalendarCheck2, Grid2X2, Tags } from "lucide-react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="auth-page">
      <section className="auth-panel" aria-label="Product overview">
        <div className="brand-mark brand-mark--large" aria-hidden="true">
          S
        </div>
        <h1>Schedule Todo App</h1>
        <p>
          A focused workspace for planning deadlines, tagging work, and deciding what deserves
          attention first.
        </p>
        <div className="auth-panel__features">
          <span>
            <CalendarCheck2 aria-hidden="true" />
            Calendar planning
          </span>
          <span>
            <Grid2X2 aria-hidden="true" />
            Priority matrix
          </span>
          <span>
            <Tags aria-hidden="true" />
            Calm tagging
          </span>
        </div>
      </section>
      <section className="auth-card">{children}</section>
    </main>
  );
}
