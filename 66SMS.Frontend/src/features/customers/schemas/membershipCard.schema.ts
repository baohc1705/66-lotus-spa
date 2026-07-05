import { z } from "zod";
import { VALIDATION_MSG } from "@/shared/constants/validation.messages";

export const updateMembershipCardSchema = z.object({
  membershipTierId: z.coerce.number().nullable().optional(),
  cardCode: z
    .string()
    .min(1, VALIDATION_MSG.required("Mã thẻ"))
    .max(50, VALIDATION_MSG.max(50))
    .optional(),
  issuedAt: z.string().optional().or(z.literal("")),
  expiresAt: z.string().optional().or(z.literal("")),
  status: z.coerce.number().min(0).optional(),
});

export type UpdateMembershipCardPayload = z.infer<
  typeof updateMembershipCardSchema
>;
export type MembershipCardFormValues = UpdateMembershipCardPayload;
