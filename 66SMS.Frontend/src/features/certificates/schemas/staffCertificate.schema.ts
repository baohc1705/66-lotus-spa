import { z } from "zod";
import { VALIDATION_MSG } from "@/shared/constants/validation.messages";

const staffCertificateBaseSchema = z.object({
  staffId: z.coerce
    .number()
    .min(1, VALIDATION_MSG.selectRequired("nhân viên")),
  certificateTypeId: z.coerce
    .number()
    .min(1, VALIDATION_MSG.selectRequired("loại chứng chỉ")),
  certificateName: z
    .string()
    .min(1, VALIDATION_MSG.required("Tên chứng chỉ"))
    .max(200, VALIDATION_MSG.max(200)),
  certificateNumber: z
    .string()
    .max(50, VALIDATION_MSG.max(50))
    .optional()
    .or(z.literal("")),
  issuingOrganization: z
    .string()
    .min(1, VALIDATION_MSG.required("Tổ chức cấp"))
    .max(200, VALIDATION_MSG.max(200)),
  issuedDate: z
    .string()
    .min(1, VALIDATION_MSG.required("Ngày cấp")),
  expiryDate: z
    .string()
    .optional()
    .or(z.literal("")),
  documentUrl: z
    .string()
    .optional()
    .or(z.literal("")),
  note: z
    .string()
    .max(500, VALIDATION_MSG.max(500))
    .optional()
    .or(z.literal("")),
  status: z.coerce.number().min(0).optional().default(0),
});

export const createStaffCertificateSchema = staffCertificateBaseSchema;
export const updateStaffCertificateSchema = staffCertificateBaseSchema.omit({ staffId: true }).partial();

export type CreateStaffCertificatePayload = z.infer<typeof createStaffCertificateSchema>;
export type UpdateStaffCertificatePayload = z.infer<typeof updateStaffCertificateSchema>;
export type StaffCertificateFormValues = CreateStaffCertificatePayload;
