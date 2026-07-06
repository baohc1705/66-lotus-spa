export interface ServiceCategoryDto {
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

export interface DeleteServiceCategoryMultiplesPayload {
  ids: number[];
}

export type {
  CreateServiceCategoryPayload,
  UpdateServiceCategoryPayload,
  ServiceCategoryFormValues,
} from "../schemas/serviceCategory.schema";
