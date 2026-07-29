import { z } from "zod";
import { VALIDATION_MSG } from "@/shared/constants/validation.messages";

const VIETNAM_PHONE_REGEX = /^(0[2-9]|84[2-9])\d{8}$/;

const staffBaseSchema = z.object({
  salonId: z.coerce.number().optional(),

  fullName: z
    .string()
    .min(1, VALIDATION_MSG.required("Họ tên"))
    .max(100, VALIDATION_MSG.max(100)),
  phone: z
    .string()
    .min(1, VALIDATION_MSG.required("SĐT"))
    .regex(VIETNAM_PHONE_REGEX, "SĐT không hợp lệ"),
  avatarUrl: z.string().optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.coerce.number().min(0).optional(),
  nationalId: z
    .string()
    .max(20, VALIDATION_MSG.max(20))
    .optional()
    .or(z.literal("")),

  hireDate: z.string().optional().or(z.literal("")),
  contractType: z
    .string()
    .max(50, VALIDATION_MSG.max(50))
    .optional()
    .or(z.literal("")),
  basicSalary: z.coerce
    .number()
    .min(0, VALIDATION_MSG.notNegative("Lương"))
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
export const updateStaffSchema = staffBaseSchema.partial();

export type CreateStaffPayload = z.infer<typeof createStaffSchema>;
export type UpdateStaffPayload = z.infer<typeof updateStaffSchema>;
export type StaffFormValues = CreateStaffPayload;
