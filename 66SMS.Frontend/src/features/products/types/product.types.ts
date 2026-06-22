import type { PageRequest } from "@/shared/types/common.types";

export interface ProductImageDto {
  id: number
  productId: number
  url: string
  isPrimary: boolean
  sortOrder?: number
}


export interface ProductDto {
  id: number | null
  categoryId: number | null
  categoryName: string | null
  code: string | null
  name: string | null
  description: string | null
  content: string | null
  unit: string | null
  costPrice: number | null
  sellingPrice: number | null
  stockQuantity: number | null
  minStock: number | null
  status: number | null
  createdAt: string | null
  createdBy?: number | null
  updatedAt: string | null
  updatedBy?: number | null
  images?: ProductImageDto[] | null
}

export interface CreateProductPayload {
  categoryId: number
  code: string
  name: string
  description?: string
  content?: string
  unit: string
  costPrice: number
  sellingPrice?: number
  stockQuantity: number
  minStock: number
  status: number
  images?: { url: string; isPrimary: boolean }[]
}

export interface UpdateProductPayload {
  categoryId?: number
  code?: string
  name?: string
  description?: string
  content?: string
  unit?: string
  costPrice?: number
  sellingPrice?: number
  stockQuantity?: number
  minStock?: number
  status?: number
  images?: { id?: number; url: string; isPrimary: boolean }[]
}

export interface ProductCategoryDto {
  id: number
  name: string
  code?: string
  description?: string
}

export interface GetAllProductQuery extends PageRequest {
  categoryId?: number;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: number;
}

export interface CreateProductImagePayload {
  productId: number;
  url: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface UpdateProductImagePayload {
  productId?: number;
  url?: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

