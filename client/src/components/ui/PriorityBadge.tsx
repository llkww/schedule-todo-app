import type { Importance, Urgency } from "../../types/domain";
import { importanceLabels, urgencyLabels } from "../../utils/labels";
import { Badge } from "./Badge";

export function ImportanceBadge({ value }: { value: Importance }) {
  const tone = value === "high" ? "danger" : value === "medium" ? "warning" : "neutral";
  return <Badge tone={tone}>重要程度：{importanceLabels[value]}</Badge>;
}

export function UrgencyBadge({ value }: { value: Urgency }) {
  const tone = value === "high" ? "danger" : value === "medium" ? "warning" : "neutral";
  return <Badge tone={tone}>紧急程度：{urgencyLabels[value]}</Badge>;
}
