import type { PageRequest } from "@/shared/types/common.types";

export interface ServiceImageResponse {
  id?: number;
  url?: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface ServiceProductResponse {
  id?: number;
  productId?: number;
  productName?: string;
  sellingPrice?: number;
  quantityUsed?: number;
  note?: string;
  status?: number;
}

export interface ServiceDTO {
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
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  imageUrl?: string;
  images?: ServiceImageResponse[];
  serviceProducts?: ServiceProductResponse[];
}

export interface ServiceImagePayload {
  url?: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface ServiceProductPayload {
  productId?: number;
  quantityUsed?: number;
  note?: string;
}

export interface CreateServicePayload {
  categoryId?: number;
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
  serviceImages?: ServiceImagePayload[];
  serviceProducts?: ServiceProductPayload[];
}

export interface UpdateServicePayload {
  id?: number;
  categoryId?: number;
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
}

export interface GetAllServiceQuery extends PageRequest {
  categoryId?: number;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: number;
}

export interface CreateServiceImagePayload {
  serviceId: number;
  url: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface UpdateServiceImagePayload {
  serviceId?: number;
  url?: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface CreateServiceProductPayload {
  serviceId: number;
  productId: number;
  quantityUsed: number;
  note?: string;
}

export interface UpdateServiceProductPayload {
  serviceId?: number;
  productId?: number;
  quantityUsed?: number;
  note?: string;
  status?: number;
}
