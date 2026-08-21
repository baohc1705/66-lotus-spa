import { productCategoryApi } from "@/features/product-categories/api/productCategory.api";
import type {
    CreateProductCategoryRequest,
    UpdateProductCategoryRequest,
} from "@/features/product-categories/types/productCategory.types";
import { StatusActive } from "@/shared/constants/status.enum";
import type { PageRequest, Result } from "@/shared/types/common.types";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { showError, showSuccess } from "@/shared/utils/kitToast";
import { createEntityQueryKeys } from "@/shared/utils/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

// Tạo query keys cho danh mục sản phẩm để dùng trong query cache
export const PRODUCT_CATEGORY_QUERY_KEY = createEntityQueryKeys<PageRequest & { isDeleted?: boolean }>("product-categories");

// Lấy danh sách danh mục
export function useProductCategories(params: PageRequest, enabled = true) {
  return useQuery({
    queryKey: PRODUCT_CATEGORY_QUERY_KEY.list(params),
    queryFn: () => productCategoryApi.getAll(params),
    enabled,
  });
}

// Lấy danh sách danh mục admin
export function useProductCategoriesAdmin(
  params: PageRequest & { isDeleted?: boolean },
  enabled = true,
) {
  return useQuery({
    queryKey: PRODUCT_CATEGORY_QUERY_KEY.adminList(params),
    queryFn: () => productCategoryApi.adminGetAll(params),
    enabled,
  });
}

// Lấy chi tiết danh mục
export function useProductCategoryDetail(id: number) {
  return useQuery({
    queryKey: PRODUCT_CATEGORY_QUERY_KEY.detail(id),
    queryFn: () => productCategoryApi.getDetail(id),
  });
}

// Tạo danh mục
export function useCreateProductCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductCategoryRequest) =>
      productCategoryApi.create(data),
    onSuccess: (result) => {
      if (!result.isSuccess) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({
        queryKey: PRODUCT_CATEGORY_QUERY_KEY.all,
      });
      showSuccess(`Tạo danh mục thành công`);
    },

    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, `Có lỗi xảy ra khi tạo danh mục`));
    },
  });
}

// Sửa danh mục
export function useUpdateProductCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateProductCategoryRequest;
    }) => productCategoryApi.update(id, data),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({
        queryKey: PRODUCT_CATEGORY_QUERY_KEY.all,
      });
      showSuccess(`Sửa danh mục thành công`);
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, `Có lỗi xảy ra khi sửa danh mục`));
    },
  });
}

// Xóa danh mục
export function useDeleteProductCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productCategoryApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({
        queryKey: PRODUCT_CATEGORY_QUERY_KEY.all,
      });
      showSuccess(`Xóa danh mục thành công`);
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, `Có lỗi xảy ra khi xóa danh mục`));
    },
  });
}

// Xóa nhiều danh mục
export function useDeleteBulkProductCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => productCategoryApi.deleteBulk(ids),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({
        queryKey: PRODUCT_CATEGORY_QUERY_KEY.all,
      });
      showSuccess(`Xóa nhiều danh mục thành công`);
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, `Có lỗi xảy ra khi xóa nhiều danh mục`));
    },
  });
}

// Khôi phục danh mục
export function useRestoreProductCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      productCategoryApi.update(id, { status: StatusActive.Active }),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({
        queryKey: PRODUCT_CATEGORY_QUERY_KEY.all,
      });
      showSuccess(`Khôi phục danh mục thành công`);
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, `Có lỗi xảy ra khi khôi phục danh mục`));
    },
  });
}
