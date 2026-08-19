export interface ProductCategoryDto {
    id?: number;
    name?: string;
    description?: string;
    sortOrder?: number;
    status?: number;
  }
  
  export interface CreateProductCategoryRequest {
    name: string;
    description?: string;
    sortOrder?: number;
    status?: number;
  }
  
  export interface UpdateProductCategoryRequest {
    name?: string;
    description?: string;
    sortOrder?: number;
    status?: number;
  }
  