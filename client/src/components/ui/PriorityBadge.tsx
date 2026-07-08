import type { Importance, Urgency } from "../../types/domain";
import { Badge } from "./Badge";

export function ImportanceBadge({ value }: { value: Importance }) {
  const tone = value === "high" ? "danger" : value === "medium" ? "warning" : "neutral";
  return <Badge tone={tone}>Importance: {value}</Badge>;
}

export function UrgencyBadge({ value }: { value: Urgency }) {
  const tone = value === "high" ? "danger" : value === "medium" ? "warning" : "neutral";
  return <Badge tone={tone}>Urgency: {value}</Badge>;
}
