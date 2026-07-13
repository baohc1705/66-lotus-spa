import { z } from "zod";
import { VALIDATION_MSG } from "@/shared/constants/validation.messages";

const serviceCategoryBaseSchema = z.object({
  name: z
    .string()
    .nonempty(VALIDATION_MSG.required("Tên nhóm dịch vụ"))
    .max(100, VALIDATION_MSG.max(100)),
  description: z
    .string()
    .max(500, VALIDATION_MSG.max(500))
    .optional()
    .or(z.literal("")),
  sortOrder: z.coerce.number().min(0, VALIDATION_MSG.min(0)).optional(),
  status: z.coerce.number().optional(),
  /** Base64 khi upload mới; URL khi hiển thị từ API */
  icon: z.string().optional().or(z.literal("")),
  imageUrl: z.string().optional().or(z.literal("")),
});

export const createServiceCategorySchema = serviceCategoryBaseSchema;
export const updateServiceCategorySchema = serviceCategoryBaseSchema.partial();

export const deleteServiceCategorySchema = z.object({
  id: z.number().min(1, "ID phải là số dương"),
});

export type CreateServiceCategoryPayload = z.infer<
  typeof createServiceCategorySchema
>;
export type UpdateServiceCategoryPayload = z.infer<
  typeof updateServiceCategorySchema
>;
export type DeleteServiceCategoryPayload = z.infer<
  typeof deleteServiceCategorySchema
>;
export type ServiceCategoryFormValues = CreateServiceCategoryPayload;
