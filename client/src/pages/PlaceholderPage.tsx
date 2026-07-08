import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title} />
      <Card>
        <p className="muted-text">这里还没有内容。</p>
      </Card>
    </>
  );
}
