import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title} description="此工作区页面正在接入中。" />
      <Card>
        <p className="muted-text">应用框架已就绪，页面功能会在后续阶段接入。</p>
      </Card>
    </>
  );
}
