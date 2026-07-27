import { z } from 'zod'
import { VALIDATION_MSG } from '@/shared/constants/validation.messages'

const landingBannerBaseSchema = z.object({
  title: z.string().min(1, VALIDATION_MSG.required('Tiêu đề')).max(200, VALIDATION_MSG.max(200)),
  subtitle: z.string().max(1000, VALIDATION_MSG.max(1000)).optional().or(z.literal('')),
  brandLabel: z.string().max(200, VALIDATION_MSG.max(200)).optional().or(z.literal('')),
  imageUrl: z.string().optional().or(z.literal('')),
  ctaPrimaryText: z.string().max(100).optional().or(z.literal('')),
  ctaPrimaryHref: z.string().max(500).optional().or(z.literal('')),
  ctaSecondaryText: z.string().max(100).optional().or(z.literal('')),
  ctaSecondaryHref: z.string().max(500).optional().or(z.literal('')),
  sortOrder: z.coerce.number().optional(),
  status: z.coerce.number().optional(),
})

export const createLandingBannerSchema = landingBannerBaseSchema

export const updateLandingBannerSchema = landingBannerBaseSchema.partial().extend({
  title: z.string().min(1, VALIDATION_MSG.required('Tiêu đề')).max(200).optional(),
})

export type CreateLandingBannerFormValues = z.infer<typeof createLandingBannerSchema>
export type UpdateLandingBannerFormValues = z.infer<typeof updateLandingBannerSchema>
export type LandingBannerFormValues = CreateLandingBannerFormValues
