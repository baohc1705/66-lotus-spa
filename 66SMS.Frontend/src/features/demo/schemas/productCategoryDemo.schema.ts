import z from "zod";
// ràng buộc dữ liệu cho form
const productCategoryBaseSchemaDemo = z.object({
  name: z
    .string()
    .nonempty("Name is required")
    .max(100, "Name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  sortOrder: z.coerce
    .number()
    .min(0, "Sort order must be greater than 0")
    .optional(),
  status: z.coerce.number().optional(),
});

export const createProductCategorySchemaDemo = productCategoryBaseSchemaDemo;
export const updateProductCategorySchemaDemo = productCategoryBaseSchemaDemo.partial();

export const deleteProductCategorySchemaDemo = z.object({
    id: z.coerce.number().min(1, "ID must be a positive number"),
  });

export type CreateProductCategoryPayloadDemo = z.infer<typeof createProductCategorySchemaDemo>;
export type UpdateProductCategoryPayloadDemo = z.infer<typeof updateProductCategorySchemaDemo>;
export type DeleteProductCategoryPayloadDemo = z.infer<typeof deleteProductCategorySchemaDemo>;
export type ProductCategoryFormValuesDemo = CreateProductCategoryPayloadDemo;