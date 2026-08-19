import type { PageRequest } from "@/shared/types/common.types";

export interface ServiceCategoryDto {
  id?: number;
  name?: string;
  description?: string;
  sortOrder?: number;
  status?: number;
  icon?: string;
  imageUrl?: string;
}

export interface GetAllServiceCategoryQuery extends PageRequest {
  keyword?: string;
  status?: number;
  isDeleted?: boolean;
}

export interface CreateServiceCategoryRequest {
  name: string;
  description?: string;
  sortOrder?: number;
  status?: number;
  icon?: string;
  imageUrl?: string;
}

export interface UpdateServiceCategoryRequest {
  name?: string;
  description?: string;
  sortOrder?: number;
  status?: number;
  icon?: string;
  imageUrl?: string;
}
