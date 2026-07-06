export interface ProductCategoryDto {
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

export interface DeleteProductCategoryMultiplesPayload {
  ids: number[];
}

export type {
  CreateProductCategoryPayload,
  UpdateProductCategoryPayload,
  ProductCategoryFormValues,
} from "../schemas/productCategory.schema";
