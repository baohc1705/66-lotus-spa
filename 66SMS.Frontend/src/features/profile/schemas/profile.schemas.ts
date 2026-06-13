import { z } from 'zod'

export const profileSchema = z.object({
  fullName: z.string().min(1, 'Họ tên không được để trống'),
  phoneNumber: z.string().min(10, 'Số điện thoại không hợp lệ').max(11, 'Số điện thoại không hợp lệ'),
  profilePhotoUrl: z.string().optional().nullable(),
})

export type ProfileFormValues = z.infer<typeof profileSchema>

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mật khẩu hiện tại không được để trống'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
  confirmPassword: z.string().min(6, 'Xác nhận mật khẩu không được để trống'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
})

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
