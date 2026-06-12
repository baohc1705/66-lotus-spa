import { z } from "zod";

const productBaseSchema = z.object({
  categoryId: z.coerce.number().min(1, "Vui lòng chọn danh mục"),
  code: z
    .string()
    .min(1, "Mã sản phẩm không được để trống")
    .max(50, "Tối đa 50 ký tự"),
  name: z
    .string()
    .min(1, "Tên sản phẩm không được để trống")
    .max(100, "Tối đa 100 ký tự"),
  description: z
    .string()
    .max(500, "Tối đa 500 ký tự")
    .optional()
    .or(z.literal("")),
  content: z.string().optional().or(z.literal("")),
  unit: z
    .string()
    .min(1, "Đơn vị tính không được để trống")
    .max(20, "Tối đa 20 ký tự"),
  costPrice: z.coerce.number().min(0, "Giá vốn không được âm"),
  sellingPrice: z.coerce.number().min(0, "Giá bán không được âm").optional(),
  stockQuantity: z.coerce.number().min(0, "Tồn kho không được âm"),
  minStock: z.coerce.number().min(0, "Tồn kho tối thiểu không được âm"),
  status: z.coerce.number().min(0),
  images: z
    .array(
      z.object({
        id: z.number().optional(),
        url: z.string().min(1, "Vui lòng nhập URL"),
        isPrimary: z.boolean().default(false),
      }),
    )
    .optional(),
});

export const createProductSchema = productBaseSchema;
export const updateProductSchema = productBaseSchema;

export type CreateProductFormData = z.infer<typeof createProductSchema>;
export type UpdateProductFormData = z.infer<typeof updateProductSchema>;

export type ProductFormValues = UpdateProductFormData;
