import type {
  CreatePromotionPayload as CreatePayload,
  UpdatePromotionPayload as UpdatePayload,
  PromotionFormValues as FormValues,
} from "../schemas/promotion.schema";

export type CreatePromotionPayload = CreatePayload;
export type UpdatePromotionPayload = UpdatePayload;
export type PromotionFormValues = FormValues;

export interface PromotionDto {
  id: number | null;
  code: string | null;
  name: string | null;
  description: string | null;
  discountType: number | null;
  discountTypeName: string | null;
  discountValue: number | null;
  maxDiscountAmount: number | null;
  minOrderValue: number | null;
  buyQuantity: number | null;
  getQuantity: number | null;
  usageLimit: number | null;
  usedCount: number | null;
  startDate: string | null;
  endDate: string | null;
  status: number | null;
  statusName: string | null;
  createdAt: string | null;
}

export const DISCOUNT_TYPE_OPTIONS = [
  { value: 1, label: "Giảm theo %" },
  { value: 2, label: "Giảm số tiền cố định" },
  { value: 3, label: "Mua X tặng Y" },
];

export const STATUS_OPTIONS = [
  { value: 1, label: "Đang hoạt động" },
  { value: 0, label: "Không hoạt động" },
];
