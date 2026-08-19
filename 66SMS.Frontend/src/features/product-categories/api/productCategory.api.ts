import type { ProductCategoryDto } from "@/features/product-categories/types/productCategory.types";
import axiosInstance from "@/shared/api/axiosInstance";
import type {
  PagedResult,
  PageRequest,
  Result,
} from "@/shared/types/common.types";
import type {
  CreateProductCategoryRequest,
  UpdateProductCategoryRequest,
} from "@/features/product-categories/types/productCategory.types";

export const productCategoryApi = {
  // Query API
  getAll: async (
    params: PageRequest,
  ): Promise<Result<PagedResult<ProductCategoryDto>>> => {
    const response = await axiosInstance.get("/product-category", {
      params,
    });
    return response.data;
  },

  adminGetAll: async (
    params: PageRequest & { isDeleted?: boolean },
  ): Promise<Result<PagedResult<ProductCategoryDto>>> => {
    const response = await axiosInstance.get("/product-category/admin", {
      params,
    });
    return response.data;
  },

  getDetail: async (id: number): Promise<Result<ProductCategoryDto>> => {
    const response = await axiosInstance.get(`/product-category/${id}`);
    return response.data;
  },

  // Command API
  create: async (
    request: CreateProductCategoryRequest,
  ): Promise<Result<object>> => {
    const response = await axiosInstance.post<Result<object>>(
      "/product-category",
      request,
    );
    return response.data;
  },

  update: async (
    id: number,
    request: UpdateProductCategoryRequest,
  ): Promise<Result<object>> => {
    const response = await axiosInstance.patch<Result<object>>(
      `/product-category/${id}`,
      request,
    );
    return response.data;
  },

  delete: async (id: number): Promise<Result<object>> => {
    const response = await axiosInstance.delete<Result<object>>(
      `/product-category/${id}`,
    );
    return response.data;
  },

  deleteBulk: async (ids: number[]): Promise<Result<object>> => {
    const response = await axiosInstance.delete<Result<object>>(
      "/product-category/bulk",
      {
        data: { ids },
      },
    );

    return response.data;
  },
};
