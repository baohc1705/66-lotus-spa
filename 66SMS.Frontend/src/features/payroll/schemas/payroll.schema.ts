import { z } from "zod";

// Schema cho form tính lương
export const generatePayrollSchema = z.object({
  staffId: z.coerce.number().min(1, "Vui lòng chọn nhân viên"),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2000).max(2100),
  excludeSaturday: z.boolean().optional(),
});

export type GeneratePayrollFormData = z.infer<typeof generatePayrollSchema>;
