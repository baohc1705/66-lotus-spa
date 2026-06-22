import { z } from 'zod'

// Regex patterns matching backend RegexConst
const VIETNAM_PHONE_REGEX = /^(0[2-9]|84[2-9])\d{8}$/

/** Schema gốc chứa tất cả các trường chung */
const customerBaseSchema = z.object({
  // Thông tin cá nhân
  fullName: z.string().min(1, 'Họ tên không được để trống').max(100, 'Tối đa 100 ký tự'),
  phone: z.string().min(1, 'SĐT không được để trống').regex(VIETNAM_PHONE_REGEX, 'SĐT không hợp lệ'),
  dateOfBirth: z.string().optional(),
  gender: z.coerce.number().min(0).optional(),
  avatarUrl: z.string().max(500).optional().or(z.literal('')),

  // Thông tin khách hàng
  loyaltyPoint: z.coerce.number().min(0, 'Điểm tích lũy phải >= 0').optional(),
  source: z.string().max(100, 'Tối đa 100 ký tự').optional().or(z.literal('')),
  status: z.coerce.number().min(0).optional(),
  note: z.string().max(500, 'Tối đa 500 ký tự').optional().or(z.literal('')),

  // Địa chỉ
  streetAddress: z.string().max(500).optional().or(z.literal('')),
  provinceCode: z.string().optional().or(z.literal('')),
  wardCode: z.string().optional().or(z.literal('')),
  fullAddress: z.string().optional().or(z.literal('')),
})

/** Schema validation cho form cập nhật khách hàng */
export const updateCustomerSchema = customerBaseSchema

/** Schema validation cho form tạo khách hàng */
export const createCustomerSchema = customerBaseSchema

// --- Type Exports ---

export type UpdateCustomerFormData = z.infer<typeof updateCustomerSchema>
export type CreateCustomerFormData = z.infer<typeof createCustomerSchema>

// Unified type cho Frontend Form State
export type CustomerFormValues = CreateCustomerFormData
