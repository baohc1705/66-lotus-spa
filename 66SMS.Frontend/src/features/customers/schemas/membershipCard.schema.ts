import { z } from 'zod'

export const updateMembershipCardSchema = z.object({
  membershipTierId: z.coerce.number().nullable().optional(),
  cardCode: z.string().min(1, 'Mã thẻ không được để trống').max(50, 'Tối đa 50 ký tự').optional(),
  issuedAt: z.string().optional().or(z.literal('')),
  expiresAt: z.string().optional().or(z.literal('')),
  status: z.coerce.number().min(0).optional(),
})

export type UpdateMembershipCardFormData = z.infer<typeof updateMembershipCardSchema>

export type MembershipCardFormValues = UpdateMembershipCardFormData
