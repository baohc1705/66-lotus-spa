// DTO trả về từ API (match backend CustomerDTO.cs)
export interface CustomerDto {
  id: number | null;
  userId: number | null;
  fullName: string | null;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  gender: number | null;
  phone: string | null;
  loyaltyPoint: number | null;
  firstPurchaseAt: string | null;
  lastPurchaseAt: string | null;
  source: string | null;
  status: number | null;
  note: string | null;
  streetAddress: string | null;
  provinceCode: string | null;
  wardCode: string | null;
  fullAddress: string | null;
  email: string | null;
  createdAt?: string | null;
  createdBy?: number | null;
  updatedAt?: string | null;
  updatedBy?: number | null;
}

export type {
  CreateCustomerPayload,
  UpdateCustomerPayload,
  CustomerFormValues,
} from "../schemas/customer.schema";
