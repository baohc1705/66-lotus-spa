import { z } from "zod";

const productCategoryBaseSchema = z.object({
  name: z
    .string()
    .nonempty("Tên không được để trống")
    .max(100, "Tối đa 100 ký tự"),
  description: z
    .string()
    .max(500, "Tối đa 500 ký tự")
    .optional()
    .or(z.literal("")),
  sortOrder: z.coerce.number().min(0, "Thứ tự phải lớn hơn 0").optional(),
  status: z.coerce.number().optional(),
});

export const createProductCategorySchema = productCategoryBaseSchema;

export const updateProductCategorySchema = productCategoryBaseSchema;

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

export type ProductCategoryFormValues = UpdateProductCategoryPayload;
