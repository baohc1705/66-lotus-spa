export interface ProductCategoryDTO {
  id?: number;
  name?: string;
  description?: string;
  sortOrder?: number;
  status?: number;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
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
