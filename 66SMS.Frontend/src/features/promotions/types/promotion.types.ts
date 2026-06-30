// DTO trả về từ API (match backend PromotionDto.cs)
export interface PromotionDto {
  id: number | null
  code: string | null
  name: string | null
  description: string | null
  discountType: number | null
  discountTypeName: string | null
  discountValue: number | null
  maxDiscountAmount: number | null
  minOrderValue: number | null
  buyQuantity: number | null
  getQuantity: number | null
  usageLimit: number | null
  usedCount: number | null
  startDate: string | null
  endDate: string | null
  status: number | null
  statusName: string | null
  createdAt: string | null
}

// Payload tạo khuyến mãi
export interface CreatePromotionPayload {
  code: string
  name: string
  description?: string
  discountType: number
  discountValue?: number
  maxDiscountAmount?: number
  minOrderValue?: number
  buyQuantity?: number
  getQuantity?: number
  usageLimit?: number
  startDate: string
  endDate: string
  status?: number
}

// Payload cập nhật khuyến mãi (tất cả optional)
export interface UpdatePromotionPayload {
  code?: string
  name?: string
  description?: string
  discountType?: number
  discountValue?: number
  maxDiscountAmount?: number
  minOrderValue?: number
  buyQuantity?: number
  getQuantity?: number
  usageLimit?: number
  startDate?: string
  endDate?: string
  status?: number
}

export const DISCOUNT_TYPE_OPTIONS = [
  { value: 1, label: 'Giảm theo %' },
  { value: 2, label: 'Giảm số tiền cố định' },
  { value: 3, label: 'Mua X tặng Y' },
]

export const STATUS_OPTIONS = [
  { value: 1, label: 'Đang hoạt động' },
  { value: 0, label: 'Không hoạt động' },
]
