import type { PageRequest } from "@/shared/types/common.types";

export interface ProductImageDto {
  id?: number;
  url?: string;
  imageBase64?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

/** DTO nhẹ cho bảng (GetAll) */
export interface ProductDto {
  id?: number | null;
  categoryId?: number | null;
  categoryName?: string | null;
  code?: string | null;
  name?: string | null;
  unit?: string | null;
  costPrice?: number | null;
  sellingPrice?: number | null;
  stockQuantity?: number | null;
  minStock?: number | null;
  status?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  imageUrl?: string | null;
}

/** DTO đầy đủ cho expand + form sửa (GetDetail) */
export interface ProductFullDto {
  id?: number | null;
  categoryId?: number | null;
  categoryName?: string | null;
  code?: string | null;
  name?: string | null;
  description?: string | null;
  content?: string | null;
  unit?: string | null;
  costPrice?: number | null;
  sellingPrice?: number | null;
  stockQuantity?: number | null;
  minStock?: number | null;
  status?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  images?: ProductImageDto[] | null;
}

export interface GetAllProductQuery extends PageRequest {
  categoryId?: number;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: number;
}

export interface DeleteProductMultiplesPayload {
  ids: number[];
}

export type {
  CreateProductPayload,
  UpdateProductPayload,
  ProductFormValues,
} from "../schemas/product.schema";
