import { z } from "zod";
import { VALIDATION_MSG } from "@/shared/constants/validation.messages";

const certificateTypeBaseSchema = z.object({
  code: z
    .string()
    .min(1, VALIDATION_MSG.required("Mã loại chứng chỉ"))
    .max(50, VALIDATION_MSG.max(50)),
  name: z
    .string()
    .min(1, VALIDATION_MSG.required("Tên loại chứng chỉ"))
    .max(100, VALIDATION_MSG.max(100)),
  description: z
    .string()
    .max(500, VALIDATION_MSG.max(500))
    .optional()
    .or(z.literal("")),
  sortOrder: z.coerce.number().min(0, VALIDATION_MSG.notNegative("Thứ tự hiển thị")).optional().default(0),
  status: z.coerce.number().min(0).optional().default(1),
});

export const createCertificateTypeSchema = certificateTypeBaseSchema;
export const updateCertificateTypeSchema = certificateTypeBaseSchema.partial();

export type CreateCertificateTypePayload = z.infer<typeof createCertificateTypeSchema>;
export type UpdateCertificateTypePayload = z.infer<typeof updateCertificateTypeSchema>;
export type CertificateTypeFormValues = CreateCertificateTypePayload;
