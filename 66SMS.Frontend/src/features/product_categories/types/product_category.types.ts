export interface ProductCategoryDTO {
  id?: number;
  name?: string;
  description?: string;
  sortOrder?: number;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductCategoryPayload {
  name?: string;
  description?: string;
  sortOrder?: number;
  status?: number;
}

export interface UpdateProductCategoryPayload {
  id?: number;
  name?: string;
  description?: string;
  sortOrder?: number;
  status?: number;
}
