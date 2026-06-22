import { z } from "zod";

export const serviceImageSchema = z.object({
  id: z.number().optional(),
  url: z.string().url("URL không hợp lệ").or(z.literal("")),
  sortOrder: z.coerce.number().optional(),
  isPrimary: z.boolean().optional(),
});

export const serviceProductSchema = z.object({
  id: z.number().optional(),
  productId: z.coerce.number().min(1, "Vui lòng chọn sản phẩm"),
  quantityUsed: z.coerce.number().min(1, "Số lượng phải lớn hơn 0"),
  note: z.string().optional(),
  costPrice: z.coerce.number().optional(),
});

const serviceBaseSchema = z.object({
  categoryId: z.coerce.number().min(1, "Vui lòng chọn nhóm dịch vụ"),
  code: z.string().max(50, "Mã tối đa 50 ký tự").optional().or(z.literal("")),
  name: z.string().nonempty("Tên dịch vụ không được để trống").max(100, "Tên tối đa 100 ký tự"),
  description: z.string().max(500, "Tối đa 500 ký tự").optional().or(z.literal("")),
  content: z.string().optional().or(z.literal("")),
  durationMins: z.coerce.number().min(0, "Thời gian phải lớn hơn hoặc bằng 0").optional(),
  costPrice: z.coerce.number().min(0, "Giá cơ bản phải lớn hơn hoặc bằng 0"),
  sellingPrice: z.coerce.number().min(0, "Giá bán phải lớn hơn hoặc bằng 0").optional(),
  commissionRate: z.coerce.number().min(0).max(100, "Tỷ lệ hoa hồng từ 0-100").optional(),
  sortOrder: z.coerce.number().min(0).optional(),
  status: z.coerce.number().optional(),
  images: z.array(serviceImageSchema).optional(),
  serviceProducts: z.array(serviceProductSchema).optional(),
});

export const createServiceSchema = serviceBaseSchema;

export const updateServiceSchema = serviceBaseSchema;

export const deleteServiceSchema = z.object({
  id: z.number().min(1, "ID phải là số dương"),
});

export type CreateServicePayload = z.infer<typeof createServiceSchema>;
export type UpdateServicePayload = z.infer<typeof updateServiceSchema> & { id?: number };
export type DeleteServicePayload = z.infer<typeof deleteServiceSchema>;

export type ServiceFormValues = z.infer<typeof updateServiceSchema>;
