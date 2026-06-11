export interface ServiceCategoryDTO {
  id?: number;
  name?: string;
  description?: string;
  sortOrder?: number;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateServiceCategoryPayload {
  name?: string;
  description?: string;
  sortOrder?: number;
  status?: number;
}

export interface UpdateServiceCategoryPayload {
  id?: number;
  name?: string;
  description?: string;
  sortOrder?: number;
  status?: number;
}
