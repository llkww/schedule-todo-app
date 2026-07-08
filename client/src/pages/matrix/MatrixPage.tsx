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
      setError(requestError instanceof Error ? requestError.message : "四象限加载失败");
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
        title="优先级四象限"
        description="优先处理真正重要的事。"
      />
      {loading ? <SkeletonList rows={4} /> : null}
      {!loading && error ? (
        <EmptyState title="四象限无法加载" description={error} action={<Button onClick={() => void load()}>重试</Button>} />
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
                  {quadrant.items.length === 0 ? <p className="muted-text">这里还没有日程。</p> : null}
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
