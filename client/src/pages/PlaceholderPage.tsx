import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title} description="This workspace page is being connected." />
      <Card>
        <p className="muted-text">The application shell is ready. Page functionality is added in the next phase.</p>
      </Card>
    </>
  );
}
