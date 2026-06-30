import { z } from 'zod'

const staffSalonBaseSchema = z.object({
  staffId: z.coerce.number().min(1, 'Vui lòng chọn nhân viên'),
  salonId: z.coerce.number().min(1, 'Vui lòng chọn chi nhánh'),
  isManager: z.boolean().optional().default(false),
  startDate: z.string().nonempty('Ngày bắt đầu không được để trống'),
  endDate: z.string().optional().or(z.literal('')),
  status: z.coerce.number().optional(),
})

export const createStaffSalonSchema = staffSalonBaseSchema

export const updateStaffSalonSchema = z.object({
  isManager: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional().or(z.literal('')),
  status: z.coerce.number().optional(),
})

export type CreateStaffSalonFormValues = z.infer<typeof createStaffSalonSchema>
export type UpdateStaffSalonFormValues = z.infer<typeof updateStaffSalonSchema>
