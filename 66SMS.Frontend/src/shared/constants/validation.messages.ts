export const VALIDATION_MSG = {
  required: (field: string) => `${field} không được để trống`,
  selectRequired: (field: string) => `Vui lòng chọn ${field}`,
  max: (max: number) => `Tối đa ${max} ký tự`,
  min: (min: number) => `Phải lớn hơn hoặc bằng ${min}`,
  notNegative: (field: string) => `${field} không được âm`,
  urlRequired: "Vui lòng nhập URL",
} as const;
