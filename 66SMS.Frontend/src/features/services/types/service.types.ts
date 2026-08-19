import type { PageRequest } from "@/shared/types/common.types";

export interface ServiceProductDto {
  id?: number;
  productId?: number;
  productName?: string;
  unitCost?: number;
  quantityUsed?: number;
  note?: string;
  status?: number;
}

export interface ServiceDto {
  id?: number;
  categoryId?: number;
  categoryName?: string;
  code?: string;
  name?: string;
  durationMins?: number;
  sellingPrice?: number;
  status?: number;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceFullDto {
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
  minSellingPrice?: number;
  commissionRate?: number;
  sortOrder?: number;
  status?: number;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  serviceProducts?: ServiceProductDto[];
  productCost?: number;
  totalCost?: number;
  commissionAmount?: number;
  grossProfit?: number;
  grossMarginPercent?: number;
}

export interface GetAllServiceQuery extends PageRequest {
  categoryId?: number;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: number;
  isDeleted?: boolean;
}

export interface CreateServiceRequest {
  categoryId: number;
  name: string;
  description?: string;
  content?: string;
  durationMins: number;
  costPrice: number;
  sellingPrice: number;
  minSellingPrice?: number;
  commissionRate?: number;
  sortOrder?: number;
  status?: number;
  imageUrl?: string;
  serviceProducts?: ServiceProductDto[];
}

export interface UpdateServiceRequest {
  categoryId?: number;
  name?: string;
  description?: string;
  content?: string;
  durationMins?: number;
  costPrice?: number;
  sellingPrice?: number;
  minSellingPrice?: number;
  commissionRate?: number;
  sortOrder?: number;
  status?: number;
  imageUrl?: string;
  serviceProducts?: ServiceProductDto[];
}
