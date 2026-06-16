import { z } from 'zod'

export const createMembershipTierSchema = z.object({
  name: z.string().min(1, 'Tên loại thẻ không được để trống').max(100, 'Tối đa 100 ký tự'),
  minSpending: z.coerce.number().min(0, 'Chi tiêu tối thiểu phải >= 0'),
  discountPercent: z.coerce.number().min(0, 'Phần trăm giảm giá phải >= 0').max(100, 'Tối đa 100%').optional(),
  pointMultiplier: z.coerce.number().min(0, 'Hệ số điểm phải >= 0'),
  benefits: z.string().max(500, 'Tối đa 500 ký tự').optional().or(z.literal('')),
  status: z.coerce.number().min(0),
})

export const updateMembershipTierSchema = createMembershipTierSchema

export type CreateMembershipTierFormData = z.infer<typeof createMembershipTierSchema>
export type UpdateMembershipTierFormData = z.infer<typeof updateMembershipTierSchema>

export type MembershipTierFormValues = CreateMembershipTierFormData & UpdateMembershipTierFormData
