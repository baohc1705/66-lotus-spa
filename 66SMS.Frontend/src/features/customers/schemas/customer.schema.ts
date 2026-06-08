import { z } from 'zod'

// Regex patterns matching backend RegexConst
const VIETNAM_PHONE_REGEX = /^(0[2-9]|84[2-9])\d{8}$/
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

/** Schema gốc chứa tất cả các trường chung */
const customerBaseSchema = z.object({
  // Thông tin cá nhân
  fullName: z.string().min(1, 'Họ tên không được để trống').max(100, 'Tối đa 100 ký tự'),
  phone: z.string().min(1, 'SĐT không được để trống').regex(VIETNAM_PHONE_REGEX, 'SĐT không hợp lệ'),
  dob: z.string().optional(),
  gender: z.coerce.number().min(0).optional(),
  image: z.string().max(500).optional().or(z.literal('')),

  // Thông tin khách hàng
  tier: z.string().max(20, 'Tối đa 20 ký tự').optional().or(z.literal('')),
  loyaltyPoint: z.coerce.number().min(0, 'Điểm tích lũy phải >= 0').optional(),
  source: z.string().max(100, 'Tối đa 100 ký tự').optional().or(z.literal('')),
  status: z.coerce.number().min(0).optional(),
  note: z.string().max(500, 'Tối đa 500 ký tự').optional().or(z.literal('')),

  // Địa chỉ
  streetAddress: z.string().max(500).optional().or(z.literal('')),
  provinceCode: z.string().optional().or(z.literal('')),
  wardCode: z.string().optional().or(z.literal('')),
  fullAddreess: z.string().optional().or(z.literal('')),

  // Tài khoản
  userName: z.string().min(1, 'Tên tài khoản không được để trống').max(50, 'Tối đa 50 ký tự')
    .regex(USERNAME_REGEX, 'Chỉ chấp nhận chữ, số và dấu gạch dưới'),
  email: z.string().min(1, 'Email không được để trống').max(100, 'Tối đa 100 ký tự')
    .regex(EMAIL_REGEX, 'Email không hợp lệ'),
})

/** Schema validation cho form cập nhật khách hàng (không có password) */
export const updateCustomerSchema = customerBaseSchema

/** Schema validation cho form tạo khách hàng (bắt buộc có password) */
export const createCustomerSchema = customerBaseSchema.extend({
  password: z.string().min(1, 'Mật khẩu không được để trống')
    .regex(PASSWORD_REGEX, 'Tối thiểu 8 ký tự, gồm chữ hoa, thường, số và ký tự đặc biệt'),
  confirmPassword: z.string().min(1, 'Xác nhận mật khẩu không được để trống'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
})

// --- Type Exports ---

export type UpdateCustomerFormData = z.infer<typeof updateCustomerSchema>
export type CreateCustomerFormData = z.infer<typeof createCustomerSchema>

// Unified type cho Frontend Form State để tránh lỗi TypeScript Union
export type CustomerFormValues = UpdateCustomerFormData & {
  password?: string
  confirmPassword?: string
}
