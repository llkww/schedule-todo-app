export const importanceValues = ["low", "medium", "high"] as const;
export const urgencyValues = ["low", "medium", "high"] as const;
export const statusValues = ["pending", "in_progress", "completed", "cancelled"] as const;

export type ImportanceValue = (typeof importanceValues)[number];
export type UrgencyValue = (typeof urgencyValues)[number];
export type StatusValue = (typeof statusValues)[number];

const dbImportanceMap: Record<ImportanceValue, string> = {
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
};

const dbUrgencyMap: Record<UrgencyValue, string> = {
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
};

const dbStatusMap: Record<StatusValue, string> = {
  pending: "PENDING",
  in_progress: "IN_PROGRESS",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
};

export function toDbImportance(value: ImportanceValue) {
  return dbImportanceMap[value];
}

export function toDbUrgency(value: UrgencyValue) {
  return dbUrgencyMap[value];
}

export function toDbStatus(value: StatusValue) {
  return dbStatusMap[value];
}

export function fromDbValue<T extends string>(value: string): Lowercase<T> {
  return value.toLowerCase() as Lowercase<T>;
}
