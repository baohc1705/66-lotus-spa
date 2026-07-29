import { z } from "zod";
import { VALIDATION_MSG } from "@/shared/constants/validation.messages";
const VIETNAM_PHONE_REGEX = /^(0[2-9]|84[2-9])\d{8}$/;
const customerBaseSchema = z.object({
  fullName: z
    .string()
    .min(1, VALIDATION_MSG.required("Họ tên"))
    .max(100, VALIDATION_MSG.max(100)),
  phone: z
    .string()
    .min(1, VALIDATION_MSG.required("SĐT"))
    .regex(VIETNAM_PHONE_REGEX, "SĐT không hợp lệ"),
  email: z
    .string()
    .min(1, VALIDATION_MSG.required("Email"))
    .email("Email không hợp lệ")
    .max(100, VALIDATION_MSG.max(100)),
  dateOfBirth: z.string().optional(),
  gender: z.coerce.number().min(0).optional(),
  avatarUrl: z.string().max(500).optional().or(z.literal("")),
  loyaltyPoint: z.coerce
    .number()
    .min(0, VALIDATION_MSG.notNegative("Điểm tích lũy"))
    .optional(),
  source: z
    .string()
    .max(100, VALIDATION_MSG.max(100))
    .optional()
    .or(z.literal("")),
  status: z.coerce.number().min(0).optional(),
  note: z
    .string()
    .max(500, VALIDATION_MSG.max(500))
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
    .max(100, VALIDATION_MSG.max(100))
    .optional()
    .or(z.literal("")),
});

export const createCustomerSchema = customerBaseSchema;

export type CreateCustomerPayload = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerPayload = z.infer<typeof updateCustomerSchema>;
export type CustomerFormValues = CreateCustomerPayload;
