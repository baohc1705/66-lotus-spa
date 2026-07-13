import { z } from 'zod'
import { VALIDATION_MSG } from '@/shared/constants/validation.messages'

const salonBaseSchema = z.object({
  name: z.string().min(1, VALIDATION_MSG.required('Tên chi nhánh')).max(200, VALIDATION_MSG.max(200)),
  phone: z.string().min(1, VALIDATION_MSG.required('Số điện thoại')).max(20, VALIDATION_MSG.max(20)),
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
  name: z.string().min(1, VALIDATION_MSG.required('Tên chi nhánh')).max(200).optional(),
})

export type CreateSalonFormValues = z.infer<typeof createSalonSchema>
export type UpdateSalonFormValues = z.infer<typeof updateSalonSchema>
export type SalonFormValues = CreateSalonFormValues
