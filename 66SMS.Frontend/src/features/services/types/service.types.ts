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
  quantityUsed?: number;
  note?: string;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
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
  images?: ServiceImagePayload[];
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
  images?: ServiceImagePayload[];
  serviceProducts?: ServiceProductPayload[];
}
