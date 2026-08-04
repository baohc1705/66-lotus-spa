import { z } from "zod";
import { VALIDATION_MSG } from "@/shared/constants/validation.messages";
import { SERVICE_DURATION_OPTIONS } from "../constants/service.durations";

export const serviceProductSchema = z.object({
  id: z.number().optional(),
  productId: z.coerce
    .number()
    .min(1, VALIDATION_MSG.selectRequired("sản phẩm")),
  quantityUsed: z.coerce.number().min(1, "Số lượng phải lớn hơn 0"),
  note: z.string().optional(),
  unitCost: z.coerce.number().optional(),
});

const durationValues = [...SERVICE_DURATION_OPTIONS] as number[];

const serviceBaseSchema = z.object({
  categoryId: z.coerce
    .number()
    .min(1, VALIDATION_MSG.selectRequired("nhóm dịch vụ")),
  code: z.string().max(50, VALIDATION_MSG.max(50)).optional().or(z.literal("")),
  name: z
    .string()
    .nonempty(VALIDATION_MSG.required("Tên dịch vụ"))
    .max(100, VALIDATION_MSG.max(100)),
  description: z
    .string()
    .max(500, VALIDATION_MSG.max(500))
    .optional()
    .or(z.literal("")),
  content: z.string().optional().or(z.literal("")),
  durationMins: z.coerce
    .number()
    .refine((v) => durationValues.includes(v), "Chọn thời gian hợp lệ"),
  costPrice: z.coerce.number().min(0, VALIDATION_MSG.notNegative("Giá cơ bản")),
  minSellingPrice: z.coerce
    .number()
    .min(0, VALIDATION_MSG.notNegative("Giá bán tối thiểu"))
    .optional(),
  sellingPrice: z.coerce
    .number()
    .min(0, VALIDATION_MSG.notNegative("Giá bán")),
  commissionRate: z.coerce
    .number()
    .min(0, VALIDATION_MSG.min(0))
    .max(100, "Tỷ lệ hoa hồng từ 0-100")
    .optional(),
  sortOrder: z.coerce.number().min(0, VALIDATION_MSG.min(0)).optional(),
  status: z.coerce.number().optional(),
  imageUrl: z.string().optional().or(z.literal("")),
  serviceProducts: z.array(serviceProductSchema).optional(),
});

export const serviceFormSchema = serviceBaseSchema.extend({
  desiredProfitPercent: z.coerce
    .number()
    .min(0, VALIDATION_MSG.notNegative("% lãi mong muốn"))
    .default(20),
});

export const createServiceSchema = serviceFormSchema;
export const updateServiceSchema = serviceBaseSchema.partial();

export const deleteServiceSchema = z.object({
  id: z.number().min(1, "ID phải là số dương"),
});

export type CreateServicePayload = z.infer<typeof serviceBaseSchema>;
export type UpdateServicePayload = z.infer<typeof updateServiceSchema>;
export type DeleteServicePayload = z.infer<typeof deleteServiceSchema>;
export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
