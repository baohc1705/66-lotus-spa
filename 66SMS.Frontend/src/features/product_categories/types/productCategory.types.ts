export interface ProductCategoryDto {
  id?: number;
  name?: string;
  description?: string;
  sortOrder?: number;
  status?: number;
}

export interface DeleteProductCategoryMultiplesPayload {
  ids: number[];
}

export type {
  CreateProductCategoryPayload,
  UpdateProductCategoryPayload,
  ProductCategoryFormValues,
} from "../schemas/productCategory.schema";
