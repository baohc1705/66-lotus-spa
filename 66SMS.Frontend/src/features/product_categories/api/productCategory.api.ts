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
  getAll: (params: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<ProductCategoryDto>>>(BASE, { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<ProductCategoryDto>>(`${BASE}/${id}`)
      .then((r) => r.data),

  create: (payload: CreateProductCategoryPayload) =>
    axiosInstance.post<Result<object>>(BASE, payload).then((r) => r.data),

  update: (id: number, payload: UpdateProductCategoryPayload) =>
    axiosInstance
      .patch<Result<object>>(`${BASE}/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`${BASE}/${id}`).then((r) => r.data),

  deleteMultiples: (payload: DeleteProductCategoryMultiplesPayload) =>
    axiosInstance
      .delete<Result<object>>(`${BASE}/bulk`, { data: payload })
      .then((r) => r.data),

  getAllDeleted: (params: PageRequest) =>
    axiosInstance
      .get<
        Result<PagedResult<ProductCategoryDto>>
      >(`${BASE}/deleted`, { params })
      .then((r) => r.data),
};
