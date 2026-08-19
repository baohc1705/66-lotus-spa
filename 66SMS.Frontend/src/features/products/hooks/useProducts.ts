import { productApi } from "@/features/products/api/product.api";
import type {
  CreateProductRequest,
  GetAllProductQuery,
  UpdateProductRequest,
} from "@/features/products/types/product.types";
import { StatusActive } from "@/shared/constants/status.enum";
import type { Result } from "@/shared/types/common.types";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { showError, showSuccess } from "@/shared/utils/kitToast";
import { createEntityQueryKeys } from "@/shared/utils/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

// Tạo query keys cho sản phẩm để dùng trong query cache
export const PRODUCT_QUERY_KEY =
  createEntityQueryKeys<GetAllProductQuery>("products");

// Lấy danh sách sản phẩm
export function useProducts(params: GetAllProductQuery, enabled = true) {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEY.list(params),
    queryFn: () => productApi.getAll(params),
    enabled,
  });
}

// Lấy danh sách sản phẩm admin
export function useProductsAdmin(params: GetAllProductQuery, enabled = true) {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEY.adminList(params),
    queryFn: () => productApi.adminGetAll(params),
    enabled,
  });
}

// Lấy chi tiết sản phẩm
export function useProductDetail(id?: number | null) {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEY.detail(id ?? 0),
    queryFn: () => productApi.getDetail(id!),
    enabled: id != null && id > 0,
  });
}

// Tạo sản phẩm
export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductRequest) => productApi.create(data),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEY.all });
      showSuccess("Tạo sản phẩm thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi tạo sản phẩm"));
    },
  });
}

// Sửa sản phẩm
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductRequest }) =>
      productApi.update(id, data),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEY.all });
      showSuccess("Sửa sản phẩm thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi sửa sản phẩm"));
    },
  });
}

// Xóa sản phẩm
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEY.all });
      showSuccess("Xóa sản phẩm thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi xóa sản phẩm"));
    },
  });
}

// Xóa nhiều sản phẩm
export function useDeleteBulkProducts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => productApi.deleteBulk(ids),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEY.all });
      showSuccess("Xóa nhiều sản phẩm thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi xóa nhiều sản phẩm"));
    },
  });
}

// Khôi phục sản phẩm
export function useRestoreProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      productApi.update(id, { status: StatusActive.Active }),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEY.all });
      showSuccess("Khôi phục sản phẩm thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi khôi phục sản phẩm"));
    },
  });
}
