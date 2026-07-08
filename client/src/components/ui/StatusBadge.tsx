import type { ScheduleStatus } from "../../types/domain";
import { Badge } from "./Badge";

export function StatusBadge({ value }: { value: ScheduleStatus }) {
  const tone =
    value === "completed"
      ? "success"
      : value === "cancelled"
        ? "neutral"
        : value === "in_progress"
          ? "primary"
          : "warning";

  const label = value.replace("_", " ");
  return <Badge tone={tone}>Status: {label}</Badge>;
}
