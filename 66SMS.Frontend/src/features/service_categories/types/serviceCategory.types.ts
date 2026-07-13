export interface ServiceCategoryDto {
  id?: number;
  name?: string;
  description?: string;
  sortOrder?: number;
  status?: number;
  icon?: string;
  imageUrl?: string;
}

export interface DeleteServiceCategoryMultiplesPayload {
  ids: number[];
}

export type {
  CreateServiceCategoryPayload,
  UpdateServiceCategoryPayload,
  ServiceCategoryFormValues,
} from "../schemas/serviceCategory.schema";
