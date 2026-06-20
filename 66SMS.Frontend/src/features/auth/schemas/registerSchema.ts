import { z } from 'zod'

const VIETNAM_PHONE_REGEX = /^(0[2-9]|84[2-9])\d{8}$/
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

export const registerSchema = z.object({
  fullName: z.string().min(1, 'Họ tên không được để trống').max(100, 'Tối đa 100 ký tự'),
  phone: z.string().min(1, 'SĐT không được để trống').regex(VIETNAM_PHONE_REGEX, 'SĐT không hợp lệ'),
  userName: z.string().min(1, 'Tên tài khoản không được để trống').max(50, 'Tối đa 50 ký tự')
    .regex(USERNAME_REGEX, 'Chỉ chấp nhận chữ, số và dấu gạch dưới'),
  email: z.string().min(1, 'Email không được để trống').max(100, 'Tối đa 100 ký tự')
    .regex(EMAIL_REGEX, 'Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu không được để trống')
    .regex(PASSWORD_REGEX, 'Tối thiểu 8 ký tự, gồm chữ hoa, thường, số và ký tự đặc biệt'),
  confirmPassword: z.string().min(1, 'Xác nhận mật khẩu không được để trống'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
})

export type RegisterFormData = z.infer<typeof registerSchema>
