import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import { productApi, productCategoryApi, productImageApi } from '../api/product.api'
import { getErrorMessage } from '@/shared/utils/errorUtils'
import type { PageRequest, Result } from '@/shared/types/common.types'
import type { 
  CreateProductPayload, 
  UpdateProductPayload,
  GetAllProductQuery,
  CreateProductImagePayload,
  UpdateProductImagePayload
} from '../types/product.types'

const PRODUCT_KEYS = {
  all: ['products'] as const,
  lists: () => [...PRODUCT_KEYS.all, 'list'] as const,
  list: (params: PageRequest) => [...PRODUCT_KEYS.lists(), params] as const,
  details: () => [...PRODUCT_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...PRODUCT_KEYS.details(), id] as const,
}

const CATEGORY_KEYS = {
  all: ['productCategories'] as const,
  list: () => [...CATEGORY_KEYS.all, 'list'] as const,
}

export function useProducts(params: PageRequest) {
  return useQuery({
    queryKey: PRODUCT_KEYS.list(params),
    queryFn: () => productApi.getAll(params),
  })
}

export function useAdminProducts(params: GetAllProductQuery) {
  return useQuery({
    queryKey: PRODUCT_KEYS.list(params),
    queryFn: () => productApi.adminGetAll(params),
  })
}

export function useProductDetail(id: number | null) {
  return useQuery({
    queryKey: PRODUCT_KEYS.detail(id!),
    queryFn: () => productApi.getDetail(id!),
    enabled: id !== null && id > 0,
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateProductPayload) => productApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: PRODUCT_KEYS.lists() })
        toast.success('Tạo sản phẩm thành công')
      } else {
        toast.error(result.message || 'Không thể tạo sản phẩm')
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error)),
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateProductPayload }) =>
      productApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: PRODUCT_KEYS.all })
        toast.success('Cập nhật sản phẩm thành công')
      } else {
        toast.error(result.message || 'Không thể cập nhật sản phẩm')
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error)),
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => productApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: PRODUCT_KEYS.lists() })
        toast.success('Xóa sản phẩm thành công')
      } else {
        toast.error(result.message || 'Không thể xóa sản phẩm')
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error)),
  })
}

export function useProductCategories() {
  return useQuery({
    queryKey: CATEGORY_KEYS.list(),
    queryFn: () => productCategoryApi.getAll({ pageIndex: 1, pageSize: 500 }),
  })
}

export function useCreateProductImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateProductImagePayload) => productImageApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: PRODUCT_KEYS.all })
        toast.success('Thêm ảnh thành công')
      } else {
        toast.error(result.message || 'Không thể thêm ảnh')
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      const msg = error.response?.data?.message ?? 'Đã xảy ra lỗi khi thêm ảnh';
      toast.error(msg);
    },
  })
}

export function useUpdateProductImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateProductImagePayload }) =>
      productImageApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: PRODUCT_KEYS.all })
        toast.success('Cập nhật ảnh thành công')
      } else {
        toast.error(result.message || 'Không thể cập nhật ảnh')
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      const msg = error.response?.data?.message ?? 'Đã xảy ra lỗi khi cập nhật ảnh';
      toast.error(msg);
    },
  })
}

export function useDeleteProductImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => productImageApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: PRODUCT_KEYS.all })
        toast.success('Xóa ảnh thành công')
      } else {
        toast.error(result.message || 'Không thể xóa ảnh')
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      const msg = error.response?.data?.message ?? 'Đã xảy ra lỗi khi xóa ảnh';
      toast.error(msg);
    },
  })
}
