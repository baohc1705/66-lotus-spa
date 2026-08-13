// Map type api, same BE
export interface ProductCategoryDemo {
  id?: number;
  name?: string;
  description?: string;
  sortOrder?: number;
  status?: number;
}

export interface DeleteProductCategoryMultiplesPayloadDemo {
  ids?: number[];
}

export type {
  CreateProductCategoryPayloadDemo,
  UpdateProductCategoryPayloadDemo,
  ProductCategoryFormValuesDemo,
} from "../schemas/productCategoryDemo.schema";
