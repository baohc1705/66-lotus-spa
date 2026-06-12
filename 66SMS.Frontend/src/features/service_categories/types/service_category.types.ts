export interface ServiceCategoryDTO {
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
