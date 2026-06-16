import { z } from 'zod'

const salonBaseSchema = z.object({
  code: z.string().min(1, 'Mã chi nhánh không được để trống').max(32, 'Tối đa 32 ký tự'),
  name: z.string().min(1, 'Tên chi nhánh không được để trống').max(200, 'Tối đa 200 ký tự'),
  phone: z.string().min(1, 'Số điện thoại không được để trống').max(20, 'Tối đa 20 ký tự'),
  email: z.string().email('Email không hợp lệ').max(200).optional().or(z.literal('')),
  streetAddress: z.string().max(200).optional().or(z.literal('')),
  provinceCode: z.string().max(20).optional().or(z.literal('')),
  wardCode: z.string().max(20).optional().or(z.literal('')),
  fullAddress: z.string().max(500).optional().or(z.literal('')),
  taxCode: z.string().max(20).optional().or(z.literal('')),
  workingDays: z.string().max(64).optional().or(z.literal('')),
  imageUrl: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  sortOrder: z.coerce.number().optional(),
  status: z.coerce.number().optional(),
})

export const createSalonSchema = salonBaseSchema

export const updateSalonSchema = salonBaseSchema.partial().extend({
  name: z.string().min(1, 'Tên chi nhánh không được để trống').max(200).optional(),
})

export type CreateSalonFormValues = z.infer<typeof createSalonSchema>
export type UpdateSalonFormValues = z.infer<typeof updateSalonSchema>
export type SalonFormValues = CreateSalonFormValues
