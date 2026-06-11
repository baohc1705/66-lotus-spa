import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { productApi, productCategoryApi } from '../api/product.api'
import type { PageRequest } from '@/shared/types/common.types'
import type { CreateProductPayload, UpdateProductPayload } from '../types/product.types'

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
    onError: () => toast.error('Có lỗi xảy ra khi tạo sản phẩm'),
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
    onError: () => toast.error('Có lỗi xảy ra khi cập nhật sản phẩm'),
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
    onError: () => toast.error('Có lỗi xảy ra khi xóa sản phẩm'),
  })
}

export function useProductCategories() {
  return useQuery({
    queryKey: CATEGORY_KEYS.list(),
    queryFn: () => productCategoryApi.getAll({ pageIndex: 1, pageSize: 500 }),
  })
}
