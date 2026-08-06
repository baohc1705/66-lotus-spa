import { z } from "zod";
import { VALIDATION_MSG } from "@/shared/constants/validation.messages";

const emptyToUndefined = (v: unknown) =>
  v === "" || v === null || v === undefined ? undefined : v;
const optionalUsageLimit = z.preprocess((v) => {
  if (v === "" || v === null || v === undefined) return undefined;
  const n = Number(v);
  if (Number.isNaN(n) || n <= 0) return undefined;
  return n;
}, z.number().optional());

const optionalPositiveMoney = z.preprocess((v) => {
  if (v === "" || v === null || v === undefined) return undefined;
  const n = Number(v);
  if (Number.isNaN(n) || n <= 0) return undefined;
  return n;
}, z.number().optional());

const optionalNumber = z.preprocess(
  emptyToUndefined,
  z.coerce.number().optional(),
);

export const promotionSchema = z
  .object({
    code: z
      .string()
      .min(1, VALIDATION_MSG.required("Mã khuyến mãi"))
      .max(50, VALIDATION_MSG.max(50)),
    name: z
      .string()
      .min(1, VALIDATION_MSG.required("Tên chương trình"))
      .max(200, VALIDATION_MSG.max(200)),
    description: z
      .string()
      .max(500, VALIDATION_MSG.max(500))
      .optional()
      .or(z.literal("")),
    discountType: z.coerce.number().min(1).max(3),
    discountValue: optionalNumber,
    maxDiscountAmount: optionalPositiveMoney,
    minOrderValue: optionalNumber,
    buyQuantity: optionalNumber,
    getQuantity: optionalNumber,
    usageLimit: optionalUsageLimit,
    startDate: z.string().min(1, VALIDATION_MSG.required("Ngày bắt đầu")),
    endDate: z.string().min(1, VALIDATION_MSG.required("Ngày kết thúc")),
    status: z.coerce.number().optional(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.endDate) > new Date(data.startDate);
    },
    { message: "Ngày kết thúc phải sau ngày bắt đầu", path: ["endDate"] },
  )
  .refine(
    (data) => {
      if (data.discountType === 1) {
        return (
          (data.discountValue ?? 0) > 0 && (data.discountValue ?? 0) <= 100
        );
      }
      return true;
    },
    {
      message: "Giá trị giảm phải trong khoảng 0.01 - 100 (%)",
      path: ["discountValue"],
    },
  )
  .refine(
    (data) => {
      if (data.discountType === 2) {
        return (data.discountValue ?? 0) > 0;
      }
      return true;
    },
    { message: "Số tiền giảm phải lớn hơn 0", path: ["discountValue"] },
  )
  .refine(
    (data) => {
      if (data.discountType === 3) {
        return (data.buyQuantity ?? 0) > 0;
      }
      return true;
    },
    { message: "Số lượng mua phải lớn hơn 0", path: ["buyQuantity"] },
  )
  .refine(
    (data) => {
      if (data.discountType === 3) {
        return (data.getQuantity ?? 0) > 0;
      }
      return true;
    },
    { message: "Số lượng tặng phải lớn hơn 0", path: ["getQuantity"] },
  );

export const createPromotionSchema = promotionSchema;
export const updatePromotionSchema = promotionSchema;

export type CreatePromotionPayload = z.infer<typeof createPromotionSchema>;
export type UpdatePromotionPayload = z.infer<typeof updatePromotionSchema>;

export type PromotionFormValues = z.infer<typeof promotionSchema>;
