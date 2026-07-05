import { z } from "zod";
import { VALIDATION_MSG } from "@/shared/constants/validation.messages";

// Regex patterns matching backend RegexConst
const VIETNAM_PHONE_REGEX = /^(0[2-9]|84[2-9])\d{8}$/;

/** Schema gốc chứa tất cả các trường chung */
const customerBaseSchema = z.object({
  // Thông tin cá nhân
  fullName: z
    .string()
    .min(1, VALIDATION_MSG.required("Họ tên"))
    .max(100, VALIDATION_MSG.max(100)),
  phone: z
    .string()
    .min(1, VALIDATION_MSG.required("SĐT"))
    .regex(VIETNAM_PHONE_REGEX, "SĐT không hợp lệ"),
  dateOfBirth: z.string().optional(),
  gender: z.coerce.number().min(0).optional(),
  avatarUrl: z.string().max(500).optional().or(z.literal("")),

  // Thông tin khách hàng
  loyaltyPoint: z.coerce
    .number()
    .min(0, VALIDATION_MSG.notNegative("Điểm tích lũy"))
    .optional(),
  source: z.string().max(100, VALIDATION_MSG.max(100)).optional().or(z.literal("")),
  status: z.coerce.number().min(0).optional(),
  note: z.string().max(500, VALIDATION_MSG.max(500)).optional().or(z.literal("")),

  // Địa chỉ
  streetAddress: z.string().max(500).optional().or(z.literal("")),
  provinceCode: z.string().optional().or(z.literal("")),
  wardCode: z.string().optional().or(z.literal("")),
  fullAddress: z.string().optional().or(z.literal("")),
});

/** Schema validation cho form cập nhật khách hàng */
export const updateCustomerSchema = customerBaseSchema.partial();

/** Schema validation cho form tạo khách hàng */
export const createCustomerSchema = customerBaseSchema;

// --- Type Exports ---

export type CreateCustomerPayload = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerPayload = z.infer<typeof updateCustomerSchema>;
export type CustomerFormValues = CreateCustomerPayload;
