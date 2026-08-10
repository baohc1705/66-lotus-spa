import { z } from "zod";

const VIETNAM_PHONE_REGEX = /^(0[2-9]|84[2-9])\d{8}$/;

const staffBaseSchema = z.object({
  salonId: z.coerce.number().min(1, "Vui lòng chọn chi nhánh"),

  fullName: z
    .string()
    .min(1, "Họ tên không được để trống")
    .max(100, "Tối đa 100 ký tự"),
  phone: z
    .string()
    .min(1, "Số điện thoại không được để trống")
    .regex(VIETNAM_PHONE_REGEX, "Số điện thoại không hợp lệ"),
  avatarUrl: z.string().optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.coerce.number().min(0).optional(),
  nationalId: z
    .string()
    .max(20, "Tối đa 20 ký tự")
    .optional()
    .or(z.literal("")),

  hireDate: z.string().optional().or(z.literal("")),
  contractType: z
    .string()
    .max(50, "Tối đa 50 ký tự")
    .optional()
    .or(z.literal("")),
  basicSalary: z.coerce
    .number()
    .min(0, "Lương không được âm")
    .optional(),
  salaryType: z.coerce.number().min(1).max(2).optional(),
  status: z.coerce.number().min(0).optional(),
  role: z.string().optional(),

  streetAddress: z.string().max(200).optional().or(z.literal("")),
  provinceCode: z.string().max(10).optional().or(z.literal("")),
  wardCode: z.string().max(10).optional().or(z.literal("")),
  fullAddress: z.string().max(500).optional().or(z.literal("")),
});

export const createStaffSchema = staffBaseSchema;
export const updateStaffSchema = staffBaseSchema.partial().required({
  salonId: true,
});

export type CreateStaffPayload = z.infer<typeof createStaffSchema>;
export type UpdateStaffPayload = z.infer<typeof updateStaffSchema>;
export type StaffFormValues = CreateStaffPayload;
