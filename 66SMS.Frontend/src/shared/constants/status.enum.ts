/** Khớp backend StatusActiveEnum */
export const StatusActive = {
  Inactive: 0,
  Active: 1,
  Deleted: 2,
} as const;

export type StatusActiveValue =
  (typeof StatusActive)[keyof typeof StatusActive];
