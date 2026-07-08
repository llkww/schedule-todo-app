import type { ScheduleStatus } from "../../types/domain";
import { statusLabels } from "../../utils/labels";
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

  return <Badge tone={tone}>状态：{statusLabels[value]}</Badge>;
}
