import { z } from "zod";

export const createMembershipTierSchema = z.object({
  code: z
    .string()
    .max(100, "Tối đa 100 ký tự")
    .optional()
    .or(z.literal("")),
  name: z
    .string()
    .min(1, "Tên loại thẻ không được để trống")
    .max(100, "Tối đa 100 ký tự"),
  minSpending: z.coerce
    .number()
    .min(0, "Chi tiêu tối thiểu không được âm"),
  discountPercent: z.coerce
    .number()
    .min(0, "Phần trăm giảm giá không được âm")
    .max(100, "Tối đa 100 ký tự")
    .optional(),
  pointMultiplier: z.coerce
    .number()
    .min(0, "Hệ số điểm không được âm"),
  benefits: z
    .string()
    .max(500, "Tối đa 500 ký tự")
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
