import { CalendarCheck2 } from "lucide-react";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="not-found-page">
      <div className="brand-mark brand-mark--large" aria-hidden="true">
        <CalendarCheck2 aria-hidden="true" />
      </div>
      <h1>页面未找到</h1>
      <p>这个页面暂时无法访问。</p>
      <Link className="button button--primary" to="/">
        返回仪表盘
      </Link>
    </main>
  );
}
