import { z } from "zod";

export const attendanceEditSchema = z.object({
  checkInAt: z.string().optional().or(z.literal("")),
  checkOutAt: z.string().optional().or(z.literal("")),
  status: z.string().optional().or(z.literal("")),
  note: z.string().max(500, "Tối đa 500 ký tự").optional().or(z.literal("")),
});

export type AttendanceEditFormData = z.infer<typeof attendanceEditSchema>;

export const manualAttendanceSchema = z.object({
  staffId: z.coerce.number().min(1, "Vui lòng chọn nhân viên"),
  workDate: z.string().min(1, "Vui lòng chọn ngày"),
  status: z.coerce.number().min(3, "Vui lòng chọn loại nghỉ"),
  note: z.string().max(500, "Tối đa 500 ký tự").optional().or(z.literal("")),
});

export type ManualAttendanceFormData = z.infer<typeof manualAttendanceSchema>;
