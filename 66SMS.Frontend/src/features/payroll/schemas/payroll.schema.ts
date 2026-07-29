import { z } from "zod";

export const generatePayrollSchema = z.object({
  staffId: z.coerce.number().min(1, "Vui lòng chọn nhân viên"),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2000).max(2100),
  excludeSaturday: z.boolean().optional(),
});

export type GeneratePayrollFormData = z.infer<typeof generatePayrollSchema>;

export const editPayrollSchema = z.object({
  baseAmount: z.coerce.number().min(0, "Lương cơ bản không được âm"),
  commissionAmount: z.coerce.number().min(0, "Hoa hồng không được âm"),
  note: z.string().optional(),
  status: z.coerce.number().min(1).max(2),
});

export type EditPayrollFormData = z.infer<typeof editPayrollSchema>;
