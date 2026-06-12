import { z } from 'zod'

// Regex patterns matching backend RegexConst
const VIETNAM_PHONE_REGEX = /^(0[2-9]|84[2-9])\d{8}$/
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

/** Schema gốc chứa tất cả các trường chung */
const staffBaseSchema = z.object({
  // Thông tin cá nhân
  fullName: z.string().min(1, 'Họ tên không được để trống').max(100, 'Tối đa 100 ký tự'),
  phone: z.string().min(1, 'SĐT không được để trống').regex(VIETNAM_PHONE_REGEX, 'SĐT không hợp lệ'),
  dob: z.string().optional(),
  gender: z.coerce.number().min(0).optional(),
  nationalId: z.string().max(20, 'Tối đa 20 ký tự').optional().or(z.literal('')),
  image: z.string().max(500).optional().or(z.literal('')),

  // Thông tin công việc
  hireDate: z.string().optional(),
  contractType: z.string().max(50, 'Tối đa 50 ký tự').optional().or(z.literal('')),
  basicSalary: z.coerce.number().min(0, 'Lương phải >= 0').optional(),
  status: z.coerce.number().min(0).optional(),

  // Địa chỉ
  streetAddress: z.string().max(200).optional().or(z.literal('')),
  provinceCode: z.string().max(10).optional().or(z.literal('')),
  wardCode: z.string().max(10).optional().or(z.literal('')),
  fullAddress: z.string().max(500).optional().or(z.literal('')),

  // Tài khoản
  userName: z.string().min(1, 'Tên tài khoản không được để trống').max(50, 'Tối đa 50 ký tự')
    .regex(USERNAME_REGEX, 'Chỉ chấp nhận chữ, số và dấu gạch dưới'),
  email: z.string().min(1, 'Email không được để trống').max(100, 'Tối đa 100 ký tự')
    .regex(EMAIL_REGEX, 'Email không hợp lệ'),
})

/** Schema validation cho form cập nhật nhân viên (không có password hoặc password rỗng) */
export const updateStaffSchema = staffBaseSchema.extend({
  password: z.string().optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
})

/** Schema validation cho form tạo nhân viên (bắt buộc có password) */
export const createStaffSchema = staffBaseSchema.extend({
  password: z.string().min(1, 'Mật khẩu không được để trống')
    .regex(PASSWORD_REGEX, 'Tối thiểu 8 ký tự, gồm chữ hoa, thường, số và ký tự đặc biệt'),
  confirmPassword: z.string().min(1, 'Xác nhận mật khẩu không được để trống'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
})

// --- Type Exports ---

export type UpdateStaffFormData = z.infer<typeof updateStaffSchema>
export type CreateStaffFormData = z.infer<typeof createStaffSchema>

// Unified type cho Frontend Form State để tránh lỗi TypeScript Union
export type StaffFormValues = UpdateStaffFormData & {
  password?: string
  confirmPassword?: string
}
