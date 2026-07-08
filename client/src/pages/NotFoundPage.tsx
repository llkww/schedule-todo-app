import { CalendarCheck2 } from "lucide-react";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="not-found-page">
      <div className="brand-mark brand-mark--large" aria-hidden="true">
        <CalendarCheck2 aria-hidden="true" />
      </div>
      <h1>页面未找到</h1>
      <p>该页面可能已移动，或当前工作区中不存在此路径。</p>
      <Link className="button button--primary" to="/">
        返回仪表盘
      </Link>
    </main>
  );
}
