import { z } from 'zod'
import { VALIDATION_MSG } from '@/shared/constants/validation.messages'

// Regex patterns matching backend RegexConst
const VIETNAM_PHONE_REGEX = /^(0[2-9]|84[2-9])\d{8}$/

/** Schema gốc chứa tất cả các trường chung */
const staffBaseSchema = z.object({
  // Chi nhánh (Admin/Manager chọn chi nhánh)
  salonId: z.coerce.number().optional(),

  // Thông tin cá nhân
  fullName: z.string().min(1, VALIDATION_MSG.required('Họ tên')).max(100, VALIDATION_MSG.max(100)),
  phone: z.string().min(1, VALIDATION_MSG.required('SĐT')).regex(VIETNAM_PHONE_REGEX, 'SĐT không hợp lệ'),
  dateOfBirth: z.string().optional(),
  gender: z.coerce.number().min(0).optional(),
  nationalId: z.string().max(20, VALIDATION_MSG.max(20)).optional().or(z.literal('')),
  

  // Thông tin công việc
  hireDate: z.string().optional(),
  contractType: z.string().max(50, VALIDATION_MSG.max(50)).optional().or(z.literal('')),
  basicSalary: z.coerce.number().min(0, VALIDATION_MSG.notNegative('Lương')).optional(),
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
