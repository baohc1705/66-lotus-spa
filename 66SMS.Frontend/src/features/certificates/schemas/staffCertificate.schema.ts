import { z } from "zod";

const staffCertificateBaseSchema = z.object({
  staffId: z.coerce.number().min(1, "Vui lòng chọn nhân viên"),
  certificateTypeId: z.coerce
    .number()
    .min(1, "Vui lòng chọn loại chứng chỉ"),
  certificateName: z
    .string()
    .min(1, "Tên chứng chỉ không được để trống")
    .max(200, "Tối đa 200 ký tự"),
  certificateNumber: z
    .string()
    .max(50, "Tối đa 50 ký tự")
    .optional()
    .or(z.literal("")),
  issuingOrganization: z
    .string()
    .min(1, "Tổ chức cấp không được để trống")
    .max(200, "Tối đa 200 ký tự"),
  issuedDate: z.string().min(1, "Ngày cấp không được để trống"),
  expiryDate: z.string().optional().or(z.literal("")),
  documentUrl: z.string().optional().or(z.literal("")),
  note: z
    .string()
    .max(500, "Tối đa 500 ký tự")
    .optional()
    .or(z.literal("")),
  status: z.coerce.number().min(0).optional().default(0),
});

export const createStaffCertificateSchema = staffCertificateBaseSchema;
export const updateStaffCertificateSchema = staffCertificateBaseSchema
  .omit({ staffId: true })
  .partial();

export type CreateStaffCertificatePayload = z.infer<
  typeof createStaffCertificateSchema
> & {
  imageBase64?: string;
};

export type UpdateStaffCertificatePayload = z.infer<
  typeof updateStaffCertificateSchema
> & {
  imageBase64?: string;
};

export type StaffCertificateFormValues = z.infer<
  typeof createStaffCertificateSchema
>;
