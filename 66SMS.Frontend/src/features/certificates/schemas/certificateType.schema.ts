import { z } from "zod";

const certificateTypeBaseSchema = z.object({
  code: z
    .string()
    .min(1, "Mã loại chứng chỉ không được để trống")
    .max(50, "Tối đa 50 ký tự"),
  name: z
    .string()
    .min(1, "Tên loại chứng chỉ không được để trống")
    .max(100, "Tối đa 100 ký tự"),
  description: z
    .string()
    .max(500, "Tối đa 500 ký tự")
    .optional()
    .or(z.literal("")),
  sortOrder: z.coerce
    .number()
    .min(0, "Thứ tự hiển thị không được âm")
    .optional()
    .default(0),
  status: z.coerce.number().min(0).optional().default(1),
});

export const createCertificateTypeSchema = certificateTypeBaseSchema;
export const updateCertificateTypeSchema = certificateTypeBaseSchema.partial();

export type CreateCertificateTypePayload = z.infer<
  typeof createCertificateTypeSchema
>;
export type UpdateCertificateTypePayload = z.infer<
  typeof updateCertificateTypeSchema
>;
export type CertificateTypeFormValues = CreateCertificateTypePayload;
