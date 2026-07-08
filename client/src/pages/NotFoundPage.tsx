import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="not-found-page">
      <div className="brand-mark brand-mark--large" aria-hidden="true">
        S
      </div>
      <h1>Page not found</h1>
      <p>The page may have moved, or the route does not exist in this workspace.</p>
      <Link className="button button--primary" to="/">
        Back to dashboard
      </Link>
    </main>
  );
}
