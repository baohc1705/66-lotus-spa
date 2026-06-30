import { z } from 'zod'

// Regex patterns matching backend RegexConst
const VIETNAM_PHONE_REGEX = /^(0[2-9]|84[2-9])\d{8}$/

/** Schema gốc chứa tất cả các trường chung */
const staffBaseSchema = z.object({
  // Chi nhánh (Admin/Manager chọn chi nhánh)
  salonId: z.coerce.number().optional(),

  // Thông tin cá nhân
  fullName: z.string().min(1, 'Họ tên không được để trống').max(100, 'Tối đa 100 ký tự'),
  phone: z.string().min(1, 'SĐT không được để trống').regex(VIETNAM_PHONE_REGEX, 'SĐT không hợp lệ'),
  dateOfBirth: z.string().optional(),
  gender: z.coerce.number().min(0).optional(),
  nationalId: z.string().max(20, 'Tối đa 20 ký tự').optional().or(z.literal('')),
  avatarUrl: z.string().max(500).optional().or(z.literal('')),

  // Thông tin công việc
  hireDate: z.string().optional(),
  contractType: z.string().max(50, 'Tối đa 50 ký tự').optional().or(z.literal('')),
  basicSalary: z.coerce.number().min(0, 'Lương phải >= 0').optional(),
  salaryType: z.coerce.number().min(1).max(2).optional(),
  status: z.coerce.number().min(0).optional(),
  role: z.string().optional(),

  // Địa chỉ
  streetAddress: z.string().max(200).optional().or(z.literal('')),
  provinceCode: z.string().max(10).optional().or(z.literal('')),
  wardCode: z.string().max(10).optional().or(z.literal('')),
  fullAddress: z.string().max(500).optional().or(z.literal('')),
})

/** Schema validation cho form cập nhật nhân viên */
export const updateStaffSchema = staffBaseSchema

/** Schema validation cho form tạo nhân viên */
export const createStaffSchema = staffBaseSchema

// --- Type Exports ---

export type UpdateStaffFormData = z.infer<typeof updateStaffSchema>
export type CreateStaffFormData = z.infer<typeof createStaffSchema>

// Unified type cho Frontend Form State
export type StaffFormValues = CreateStaffFormData

