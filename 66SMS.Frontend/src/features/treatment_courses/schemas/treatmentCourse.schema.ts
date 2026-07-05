import { z } from "zod";
import { VALIDATION_MSG } from "@/shared/constants/validation.messages";

const itemSchema = z.object({
  serviceId: z.coerce.number().min(1, VALIDATION_MSG.selectRequired("dịch vụ")),
  sessionNumber: z.coerce.number().min(1, VALIDATION_MSG.min(1)),
  quantity: z.coerce.number().min(1, VALIDATION_MSG.min(1)),
  note: z.string().max(500, VALIDATION_MSG.max(500)).optional().or(z.literal("")),
  status: z.coerce.number().optional(),
});

export const treatmentCourseSchema = z.object({
  code: z
    .string()
    .nonempty(VALIDATION_MSG.required("Mã liệu trình"))
    .max(50, VALIDATION_MSG.max(50)),
  name: z
    .string()
    .nonempty(VALIDATION_MSG.required("Tên liệu trình"))
    .max(200, VALIDATION_MSG.max(200)),
  description: z
    .string()
    .max(500, VALIDATION_MSG.max(500))
    .optional()
    .or(z.literal("")),
  content: z.string().optional().or(z.literal("")),
  categoryId: z.coerce.number().optional(),
  originalPrice: z.coerce.number().min(0, VALIDATION_MSG.notNegative("Giá gốc")),
  sellingPrice: z.coerce.number().min(0, VALIDATION_MSG.notNegative("Giá bán")),
  imageUrl: z
    .string()
    .max(500, VALIDATION_MSG.max(500))
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
