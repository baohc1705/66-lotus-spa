import { z } from 'zod'

const itemSchema = z.object({
  serviceId: z.coerce.number().min(1, 'Vui lòng chọn dịch vụ'),
  sessionNumber: z.coerce.number().min(1, 'Buổi phải >= 1'),
  quantity: z.coerce.number().min(1, 'Số lần phải >= 1'),
  note: z.string().max(500).optional().or(z.literal('')),
  status: z.coerce.number().optional(),
})

export const treatmentCourseSchema = z.object({
  code: z.string().min(1, 'Mã liệu trình không được để trống').max(50, 'Tối đa 50 ký tự'),
  name: z.string().min(1, 'Tên liệu trình không được để trống').max(200, 'Tối đa 200 ký tự'),
  description: z.string().max(500).optional().or(z.literal('')),
  content: z.string().optional().or(z.literal('')),
  categoryId: z.coerce.number().optional(),
  originalPrice: z.coerce.number().min(0, 'Giá gốc phải >= 0'),
  sellingPrice: z.coerce.number().min(0, 'Giá bán phải >= 0'),
  imageUrl: z.string().max(500).optional().or(z.literal('')),
  sortOrder: z.coerce.number().optional(),
  status: z.coerce.number().optional(),
  items: z.array(itemSchema).min(1, 'Cần ít nhất 1 buổi'),
})

export type TreatmentCourseFormValues = z.infer<typeof treatmentCourseSchema>
