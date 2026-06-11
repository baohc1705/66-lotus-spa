import { z } from "zod";

const serviceCategoryBaseSchema = z.object({
  name: z
    .string()
    .nonempty("Tên không được để trống")
    .max(100, "Tối đa 100 ký tự"),
  description: z
    .string()
    .max(500, "Tối đa 500 ký tự")
    .optional()
    .or(z.literal("")),
  sortOrder: z.coerce.number().min(0, "Thứ tự phải lớn hơn hoặc bằng 0").optional(),
  status: z.coerce.number().optional(),
});

export const createServiceCategorySchema = serviceCategoryBaseSchema;

export const updateServiceCategorySchema = serviceCategoryBaseSchema;

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

export type ServiceCategoryFormValues = UpdateServiceCategoryPayload;
