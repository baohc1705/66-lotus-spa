import { z } from 'zod'

export const promotionSchema = z.object({
  code: z.string().min(1, 'Mã khuyến mãi không được để trống').max(50, 'Tối đa 50 ký tự'),
  name: z.string().min(1, 'Tên không được để trống').max(200, 'Tối đa 200 ký tự'),
  description: z.string().max(500, 'Tối đa 500 ký tự').optional().or(z.literal('')),
  discountType: z.coerce.number().min(1).max(3),
  discountValue: z.coerce.number().optional(),
  maxDiscountAmount: z.coerce.number().optional(),
  minOrderValue: z.coerce.number().optional(),
  buyQuantity: z.coerce.number().optional(),
  getQuantity: z.coerce.number().optional(),
  usageLimit: z.coerce.number().optional(),
  startDate: z.string().min(1, 'Ngày bắt đầu không được để trống'),
  endDate: z.string().min(1, 'Ngày kết thúc không được để trống'),
  status: z.coerce.number().optional(),
})
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true
      return new Date(data.endDate) > new Date(data.startDate)
    },
    { message: 'Ngày kết thúc phải sau ngày bắt đầu', path: ['endDate'] }
  )
  .refine(
    (data) => {
      if (data.discountType === 1) {
        return (data.discountValue ?? 0) > 0 && (data.discountValue ?? 0) <= 100
      }
      return true
    },
    { message: 'Giá trị giảm phải trong khoảng 0.01 - 100 (%)', path: ['discountValue'] }
  )
  .refine(
    (data) => {
      if (data.discountType === 2) {
        return (data.discountValue ?? 0) > 0
      }
      return true
    },
    { message: 'Số tiền giảm phải lớn hơn 0', path: ['discountValue'] }
  )
  .refine(
    (data) => {
      if (data.discountType === 3) {
        return (data.buyQuantity ?? 0) > 0
      }
      return true
    },
    { message: 'Số lượng mua phải lớn hơn 0', path: ['buyQuantity'] }
  )
  .refine(
    (data) => {
      if (data.discountType === 3) {
        return (data.getQuantity ?? 0) > 0
      }
      return true
    },
    { message: 'Số lượng tặng phải lớn hơn 0', path: ['getQuantity'] }
  )

export type PromotionFormValues = z.infer<typeof promotionSchema>
