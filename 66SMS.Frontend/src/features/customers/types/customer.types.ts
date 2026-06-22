// DTO trả về từ API (match backend CustomerDTO.cs)
export interface CustomerDto {
  id: number | null
  userId: number | null
  fullName: string | null
  avatarUrl: string | null
  dateOfBirth: string | null
  gender: number | null
  phone: string | null
  loyaltyPoint: number | null
  firstPurchaseAt: string | null
  lastPurchaseAt: string | null
  source: string | null
  status: number | null
  note: string | null
  streetAddress: string | null
  provinceCode: string | null
  wardCode: string | null
  fullAddress: string | null
  email: string | null
  createdAt?: string | null
  createdBy?: number | null
  updatedAt?: string | null
  updatedBy?: number | null
}

// Payload tạo khách hàng (match CreateCustomerCommand, bỏ [JsonIgnore] fields: UserId, Role, CreatedBy)
export interface CreateCustomerPayload {
  fullName: string
  avatarUrl?: string
  dateOfBirth?: string
  gender?: number
  phone: string
  loyaltyPoint?: number
  firstPurchaseAt?: string
  lastPurchaseAt?: string
  source?: string
  status?: number
  note?: string
  streetAddress?: string
  provinceCode?: string
  wardCode?: string
  fullAddress?: string
}

// Payload cập nhật khách hàng (match UpdateCustomerCommand, bỏ [JsonIgnore] fields: Id, Role, CreatedBy)
export interface UpdateCustomerPayload {
  fullName?: string
  avatarUrl?: string
  dateOfBirth?: string
  gender?: number
  phone?: string
  loyaltyPoint?: number
  firstPurchaseAt?: string
  lastPurchaseAt?: string
  source?: string
  status?: number
  note?: string
  streetAddress?: string
  provinceCode?: string
  wardCode?: string
  fullAddress?: string
}
