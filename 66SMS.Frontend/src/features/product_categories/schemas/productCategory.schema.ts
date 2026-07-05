import { z } from "zod";
import { VALIDATION_MSG } from "@/shared/constants/validation.messages";

const productCategoryBaseSchema = z.object({
  name: z
    .string()
    .nonempty(VALIDATION_MSG.required("Tên"))
    .max(100, VALIDATION_MSG.max(100)),
  description: z
    .string()
    .max(500, VALIDATION_MSG.max(500))
    .optional()
    .or(z.literal("")),
  sortOrder: z.coerce.number().min(0, VALIDATION_MSG.min(0)).optional(),
  status: z.coerce.number().optional(),
});

export const createProductCategorySchema = productCategoryBaseSchema;
export const updateProductCategorySchema = productCategoryBaseSchema.partial();

export const deleteProductCategorySchema = z.object({
  id: z.number().min(1, "ID phải là số dương"),
});

export type CreateProductCategoryPayload = z.infer<
  typeof createProductCategorySchema
>;
export type UpdateProductCategoryPayload = z.infer<
  typeof updateProductCategorySchema
>;
export type DeleteProductCategoryPayload = z.infer<
  typeof deleteProductCategorySchema
>;
export type ProductCategoryFormValues = CreateProductCategoryPayload;
