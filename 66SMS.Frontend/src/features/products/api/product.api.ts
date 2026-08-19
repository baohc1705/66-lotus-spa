import type {
  CreateProductRequest,
  GetAllProductQuery,
  ProductDto,
  ProductFullDto,
  UpdateProductRequest,
} from "@/features/products/types/product.types";
import axiosInstance from "@/shared/api/axiosInstance";
import type { PagedResult, Result } from "@/shared/types/common.types";

export const productApi = {
  // Query API
  getAll: async (
    params: GetAllProductQuery,
  ): Promise<Result<PagedResult<ProductDto>>> => {
    const response = await axiosInstance.get("/product", { params });
    return response.data;
  },

  adminGetAll: async (
    params: GetAllProductQuery,
  ): Promise<Result<PagedResult<ProductDto>>> => {
    const response = await axiosInstance.get("/product/admin", { params });
    return response.data;
  },

  getDetail: async (id: number): Promise<Result<ProductFullDto>> => {
    const response = await axiosInstance.get(`/product/${id}`);
    return response.data;
  },

  // Command API
  create: async (request: CreateProductRequest): Promise<Result<object>> => {
    const response = await axiosInstance.post<Result<object>>(
      "/product",
      request,
    );
    return response.data;
  },

  update: async (
    id: number,
    request: UpdateProductRequest,
  ): Promise<Result<object>> => {
    const response = await axiosInstance.patch<Result<object>>(
      `/product/${id}`,
      request,
    );
    return response.data;
  },

  delete: async (id: number): Promise<Result<object>> => {
    const response = await axiosInstance.delete<Result<object>>(
      `/product/${id}`,
    );
    return response.data;
  },

  deleteBulk: async (ids: number[]): Promise<Result<object>> => {
    const response = await axiosInstance.delete<Result<object>>("/product/bulk", {
      data: { ids },
    });
    return response.data;
  },
};
