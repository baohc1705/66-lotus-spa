import { z } from "zod";
const VIETNAM_PHONE_REGEX = /^(0[2-9]|84[2-9])\d{8}$/;
const customerBaseSchema = z.object({
  fullName: z
    .string()
    .min(1, "Họ tên không được để trống")
    .max(100, "Tối đa 100 ký tự"),
  phone: z
    .string()
    .min(1, "Số điện thoại không được để trống")
    .regex(VIETNAM_PHONE_REGEX, "Số điện thoại không hợp lệ"),
  email: z
    .string()
    .min(1, "Email không được để trống")
    .email("Email không hợp lệ")
    .max(100, "Tối đa 100 ký tự"),
  dateOfBirth: z.string().optional(),
  gender: z.coerce.number().min(0).optional(),
  avatarUrl: z.string().max(500).optional().or(z.literal("")),
  loyaltyPoint: z.coerce
    .number()
    .min(0, "Điểm tích lũy không được âm")
    .optional(),
  source: z
    .string()
    .max(100, "Tối đa 100 ký tự")
    .optional()
    .or(z.literal("")),
  status: z.coerce.number().min(0).optional(),
  note: z
    .string()
    .max(500, "Tối đa 500 ký tự")
    .optional()
    .or(z.literal("")),
  streetAddress: z.string().max(500).optional().or(z.literal("")),
  provinceCode: z.string().optional().or(z.literal("")),
  wardCode: z.string().optional().or(z.literal("")),
  fullAddress: z.string().optional().or(z.literal("")),
});

export const updateCustomerSchema = customerBaseSchema.partial().extend({
  email: z
    .string()
    .email("Email không hợp lệ")
    .max(100, "Tối đa 100 ký tự")
    .optional()
    .or(z.literal("")),
});

export const createCustomerSchema = customerBaseSchema;

export type CreateCustomerPayload = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerPayload = z.infer<typeof updateCustomerSchema>;
export type CustomerFormValues = CreateCustomerPayload;
