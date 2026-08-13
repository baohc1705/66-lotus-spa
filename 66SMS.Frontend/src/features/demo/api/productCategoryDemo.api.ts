import axiosInstance from "@/shared/api/axiosInstance";
import {
  type PagedResult,
  type PageRequest,
  type Result,
} from "@/shared/types/common.types";
import type {
  CreateProductCategoryPayloadDemo,
  DeleteProductCategoryMultiplesPayloadDemo,
  ProductCategoryDemo,
  UpdateProductCategoryPayloadDemo,
} from "../types/productCategoryDemo.type";

export const productCategoryDemoApi = {
  getAll: async (params: PageRequest) =>
    axiosInstance
      .get<
        Result<PagedResult<ProductCategoryDemo>>
      >("/product-category", { params })
      .then((res) => res.data),
  getDetail: async (id: number) =>
    axiosInstance
      .get<Result<ProductCategoryDemo>>(`/product-category/${id}`)
      .then((res) => res.data),
  create: async (payload: CreateProductCategoryPayloadDemo) =>
    axiosInstance
      .post<Result<object>>("/product-category", { payload })
      .then((res) => res.data),
  update: async (id: number, payload: UpdateProductCategoryPayloadDemo) =>
    axiosInstance
      .patch<Result<object>>(`product-category/${id}`, { payload })
      .then((res) => res.data),
  delete: async (id: number) =>
    axiosInstance
      .delete<Result<object>>(`product-category/${id}`)
      .then((res) => res.data),
  deleteMultiples: async (payload: DeleteProductCategoryMultiplesPayloadDemo) =>
    axiosInstance
      .delete<Result<object>>(`product-category/bulk`, { data: payload })
      .then((res) => res.data),
  getAllDeleted: async (params: PageRequest) =>
    axiosInstance
      .get<
        Result<PagedResult<ProductCategoryDemo>>
      >(`product-category/deleted`, { params })
      .then((res) => res.data),
};
