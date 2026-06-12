export interface ProductImageDto {
  id: number
  productId: number
  url: string
  isPrimary: boolean
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
