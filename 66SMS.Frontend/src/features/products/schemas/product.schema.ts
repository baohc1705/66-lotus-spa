import { z } from "zod";
import { VALIDATION_MSG } from "@/shared/constants/validation.messages";

const productBaseSchema = z.object({
  categoryId: z.coerce
    .number()
    .min(1, VALIDATION_MSG.selectRequired("danh mục")),
  name: z
    .string()
    .min(1, VALIDATION_MSG.required("Tên sản phẩm"))
    .max(100, VALIDATION_MSG.max(100)),
  description: z
    .string()
    .max(500, VALIDATION_MSG.max(500))
    .optional()
    .or(z.literal("")),
  content: z.string().optional().or(z.literal("")),
  unit: z
    .string()
    .min(1, VALIDATION_MSG.required("Đơn vị tính"))
    .max(20, VALIDATION_MSG.max(20)),
  costPrice: z.coerce.number().min(0, VALIDATION_MSG.notNegative("Giá vốn")),
  sellingPrice: z.coerce
    .number()
    .min(0, VALIDATION_MSG.notNegative("Giá bán"))
    .optional(),
  stockQuantity: z.coerce
    .number()
    .min(0, VALIDATION_MSG.notNegative("Tồn kho")),
  minStock: z.coerce
    .number()
    .min(0, VALIDATION_MSG.notNegative("Tồn kho tối thiểu")),
  status: z.coerce.number().min(0),
  images: z
    .array(
      z.object({
        id: z.number().optional(),
        url: z.string().min(1, VALIDATION_MSG.urlRequired).or(z.literal("")),
        isPrimary: z.boolean().default(false),
      }),
    )
    .optional(),
});

export const createProductSchema = productBaseSchema;
export const updateProductSchema = productBaseSchema.partial();

export type CreateProductPayload = z.infer<typeof createProductSchema>;
export type UpdateProductPayload = z.infer<typeof updateProductSchema>;
export type ProductFormValues = CreateProductPayload;
