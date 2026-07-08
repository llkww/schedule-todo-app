import type { ReactNode } from "react";
import { CalendarCheck2, Grid2X2, Tags } from "lucide-react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="auth-page">
      <section className="auth-panel" aria-label="产品概览">
        <div className="brand-mark brand-mark--large" aria-hidden="true">
          <CalendarCheck2 aria-hidden="true" />
        </div>
        <h1>日程待办</h1>
        <p>规划日程、整理标签，聚焦更重要的事。</p>
        <div className="auth-panel__features">
          <span>
            <CalendarCheck2 aria-hidden="true" />
            日历规划
          </span>
          <span>
            <Grid2X2 aria-hidden="true" />
            优先级四象限
          </span>
          <span>
            <Tags aria-hidden="true" />
            清晰标签
          </span>
        </div>
      </section>
      <section className="auth-card">{children}</section>
    </main>
  );
}
