import axiosInstance from '@/shared/api/axiosInstance'
import type { Result, PagedResult, PageRequest } from '@/shared/types/common.types'
import type { ProductDto, CreateProductPayload, UpdateProductPayload, ProductCategoryDto } from '../types/product.types'

const BASE_PRODUCT = '/Product'
const BASE_CATEGORY = '/ProductCategory'

export const productApi = {
  getAll: (params: PageRequest) =>
    axiosInstance.get<Result<PagedResult<ProductDto>>>(BASE_PRODUCT, { params }).then(r => r.data),

  getDetail: (id: number) =>
    axiosInstance.get<Result<ProductDto>>(`${BASE_PRODUCT}/${id}`).then(r => r.data),

  create: (payload: CreateProductPayload) =>
    axiosInstance.post<Result<object>>(BASE_PRODUCT, payload).then(r => r.data),

  update: (id: number, payload: UpdateProductPayload) =>
    axiosInstance.patch<Result<object>>(`${BASE_PRODUCT}/${id}`, payload).then(r => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`${BASE_PRODUCT}/${id}`).then(r => r.data),
}

export const productCategoryApi = {
  getAll: (params?: PageRequest) =>
    axiosInstance.get<Result<PagedResult<ProductCategoryDto>>>(BASE_CATEGORY, { params: params || { pageIndex: 1, pageSize: 100 } }).then(r => r.data),
}
