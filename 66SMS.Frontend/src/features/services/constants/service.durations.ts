export type ServiceDurationOption = {
  value: string;
  label: string;
};

// Giải thích:
// Hardcode thời lượng dịch vụ (phút). Thêm/bớt ở đây khi cần.
export const SERVICE_DURATION_VALUES = [30, 60, 90, 120, 180];

export const SERVICE_DURATION_OPTIONS: ServiceDurationOption[] = [
  { value: "30", label: "30 phút" },
  { value: "60", label: "60 phút" },
  { value: "90", label: "90 phút" },
  { value: "120", label: "120 phút" },
  { value: "180", label: "180 phút" },
];
