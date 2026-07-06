import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
import type {
  Result,
  PagedResult,
  PageRequest,
} from "@/shared/types/common.types";
import type {
  CreateProductCategoryPayload,
  DeleteProductCategoryMultiplesPayload,
  ProductCategoryDto,
  UpdateProductCategoryPayload,
} from "../types/productCategory.types";

const BASE = API.productCategories;

export const productCategoryApi = {
  // Get All
  getAll: (params: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<ProductCategoryDto>>>(BASE, { params })
      .then((r) => r.data),

  // Get Detail
  getDetail: (id: number) =>
    axiosInstance
      .get<Result<ProductCategoryDto>>(`${BASE}/${id}`)
      .then((r) => r.data),

  // Create Category
  create: (payload: CreateProductCategoryPayload) =>
    axiosInstance.post<Result<object>>(BASE, payload).then((r) => r.data),

  // Update category
  update: (id: number, payload: UpdateProductCategoryPayload) =>
    axiosInstance
      .patch<Result<object>>(`${BASE}/${id}`, payload)
      .then((r) => r.data),

  // Delete category
  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`${BASE}/${id}`).then((r) => r.data),

  // Delete multiple categories
  deleteMultiples: (payload: DeleteProductCategoryMultiplesPayload) =>
    axiosInstance
      .delete<Result<object>>(`${BASE}/bulk`, { data: payload })
      .then((r) => r.data),

  // Get All Deleted
  getAllDeleted: (params: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<ProductCategoryDto>>>(`${BASE}/deleted`, { params })
      .then((r) => r.data),
};
