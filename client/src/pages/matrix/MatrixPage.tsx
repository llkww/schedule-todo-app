import { useCallback, useEffect, useState } from "react";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonList } from "../../components/ui/Loading";
import { PageHeader } from "../../components/ui/PageHeader";
import { TaskCard } from "../../components/ui/TaskCard";
import { fetchMatrixStats } from "../../services/stats";
import type { MatrixStats } from "../../types/domain";

const quadrantOrder: Array<keyof MatrixStats> = [
  "importantUrgent",
  "importantNotUrgent",
  "notImportantUrgent",
  "notImportantNotUrgent",
];

export function MatrixPage() {
  const [data, setData] = useState<MatrixStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await fetchMatrixStats());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Matrix failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <PageHeader
        title="Priority matrix"
        description="Separate urgent noise from important work before deciding what to do next."
      />
      {loading ? <SkeletonList rows={4} /> : null}
      {!loading && error ? (
        <EmptyState title="Matrix could not load" description={error} action={<Button onClick={() => void load()}>Retry</Button>} />
      ) : null}
      {!loading && data ? (
        <div className="matrix-grid">
          {quadrantOrder.map((key) => {
            const quadrant = data[key];
            return (
              <Card className={`matrix-card matrix-card--${key}`} key={key}>
                <div className="matrix-card__header">
                  <div>
                    <h2>{quadrant.title}</h2>
                    <p>{quadrant.description}</p>
                  </div>
                  <strong>{quadrant.count}</strong>
                </div>
                <div className="preview-list">
                  {quadrant.items.length === 0 ? <p className="muted-text">No tasks in this quadrant.</p> : null}
                  {quadrant.items.map((item) => (
                    <TaskCard compact key={item.id} schedule={item} />
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}
    </>
  );
}
