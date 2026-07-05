import { z } from "zod";
import { VALIDATION_MSG } from "@/shared/constants/validation.messages";

export const createMembershipTierSchema = z.object({
  name: z
    .string()
    .min(1, VALIDATION_MSG.required("Tên loại thẻ"))
    .max(100, VALIDATION_MSG.max(100)),
  minSpending: z.coerce
    .number()
    .min(0, VALIDATION_MSG.notNegative("Chi tiêu tối thiểu")),
  discountPercent: z.coerce
    .number()
    .min(0, VALIDATION_MSG.notNegative("Phần trăm giảm giá"))
    .max(100, VALIDATION_MSG.max(100))
    .optional(),
  pointMultiplier: z.coerce
    .number()
    .min(0, VALIDATION_MSG.notNegative("Hệ số điểm")),
  benefits: z
    .string()
    .max(500, VALIDATION_MSG.max(500))
    .optional()
    .or(z.literal("")),
  status: z.coerce.number().min(0),
});

export const updateMembershipTierSchema = createMembershipTierSchema.partial();

export type CreateMembershipTierPayload = z.infer<
  typeof createMembershipTierSchema
>;
export type UpdateMembershipTierPayload = z.infer<
  typeof updateMembershipTierSchema
>;
export type MembershipTierFormValues = CreateMembershipTierPayload;
