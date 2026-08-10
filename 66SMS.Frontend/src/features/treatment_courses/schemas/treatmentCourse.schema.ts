import { z } from "zod";

const itemSchema = z.object({
  serviceId: z.coerce.number().min(1, "Vui lòng chọn dịch vụ"),
  sessionNumber: z.coerce.number().min(1, "Phải lớn hơn hoặc bằng 1"),
  quantity: z.coerce.number().min(1, "Phải lớn hơn hoặc bằng 1"),
  note: z
    .string()
    .max(500, "Tối đa 500 ký tự")
    .optional()
    .or(z.literal("")),
  status: z.coerce.number().optional(),
});

export const treatmentCourseSchema = z.object({
  code: z
    .string()
    .nonempty("Mã liệu trình không được để trống")
    .max(50, "Tối đa 50 ký tự"),
  name: z
    .string()
    .nonempty("Tên liệu trình không được để trống")
    .max(200, "Tối đa 200 ký tự"),
  description: z
    .string()
    .max(500, "Tối đa 500 ký tự")
    .optional()
    .or(z.literal("")),
  content: z.string().optional().or(z.literal("")),
  categoryId: z.coerce.number().optional(),
  originalPrice: z.coerce
    .number()
    .min(0, "Giá gốc không được âm"),
  sellingPrice: z.coerce.number().min(0, "Giá bán không được âm"),
  imageUrl: z
    .string()
    .max(500, "Tối đa 500 ký tự")
    .optional()
    .or(z.literal("")),
  sortOrder: z.coerce.number().optional(),
  status: z.coerce.number().optional(),
  items: z.array(itemSchema).min(1, "Cần ít nhất 1 buổi"),
});

export const createTreatmentCourseSchema = treatmentCourseSchema;
export const updateTreatmentCourseSchema = treatmentCourseSchema.partial();

export type CreateTreatmentCoursePayload = z.infer<
  typeof createTreatmentCourseSchema
>;
export type UpdateTreatmentCoursePayload = z.infer<
  typeof updateTreatmentCourseSchema
>;
export type TreatmentCourseFormValues = CreateTreatmentCoursePayload;
