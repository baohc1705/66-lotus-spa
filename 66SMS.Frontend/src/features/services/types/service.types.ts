import type { PageRequest } from "@/shared/types/common.types";
import { SERVICE_DURATION_OPTIONS } from "../constants/service.durations";

export interface ServiceProductResponse {
  id?: number;
  productId?: number;
  productName?: string;
  sellingPrice?: number;
  quantityUsed?: number;
  note?: string;
  status?: number;
}

/** DTO nhẹ cho bảng (GetAll) */
export interface ServiceListDto {
  id?: number;
  categoryId?: number;
  categoryName?: string;
  code?: string;
  name?: string;
  durationMins?: number;
  costPrice?: number;
  sellingPrice?: number;
  status?: number;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** DTO đầy đủ cho expand + form sửa (GetDetail) */
export interface ServiceDetailDto {
  id?: number;
  categoryId?: number;
  categoryName?: string;
  code?: string;
  name?: string;
  description?: string;
  content?: string;
  durationMins?: number;
  costPrice?: number;
  sellingPrice?: number;
  commissionRate?: number;
  sortOrder?: number;
  status?: number;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  serviceProducts?: ServiceProductResponse[];
}

/** Alias giữ tương thích chỗ còn dùng tên cũ (ưu tiên list) */
export type ServiceDto = ServiceListDto;

export interface ServiceProductPayload {
  productId?: number;
  quantityUsed?: number;
  note?: string;
}

export interface GetAllServiceQuery extends PageRequest {
  categoryId?: number;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: number;
}

export interface DeleteServiceMultiplesPayload {
  ids: number[];
}

export { SERVICE_DURATION_OPTIONS };

export type {
  CreateServicePayload,
  UpdateServicePayload,
  ServiceFormValues,
} from "../schemas/service.schema";
