import { productCategoryApi } from "@/features/product_categories/api/productCategory.api";
import type { PageRequest, Result } from "@/shared/types/common.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { TOAST_MSG } from "@/shared/constants/toast.messages";
import { StatusActive } from "@/shared/constants/status.enum";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { createEntityQueryKeys } from "@/shared/utils/queryKeys";
import type {
  CreateProductCategoryPayload,
  UpdateProductCategoryPayload,
} from "../types/productCategory.types";

const ENTITY = "danh mục";

export const PRODUCT_CATEGORY_KEYS =
  createEntityQueryKeys<PageRequest>("product-categories");

export function useProductCategories(params: PageRequest, enabled = true) {
  return useQuery({
    queryKey: PRODUCT_CATEGORY_KEYS.list(params),
    queryFn: () => productCategoryApi.getAll(params),
    enabled,
  });
}

export function useProductCategoryDetail(id: number | null) {
  return useQuery({
    queryKey: PRODUCT_CATEGORY_KEYS.detail(id!),
    queryFn: () => productCategoryApi.getDetail(id!),
    enabled: id !== null && id > 0,
  });
}

export function useCreateProductCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductCategoryPayload) =>
      productCategoryApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: PRODUCT_CATEGORY_KEYS.lists() });
        toast.success(TOAST_MSG.createSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(error, TOAST_MSG.actionError("tạo", ENTITY)));
    },
  });
}

export function useUpdateProductCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateProductCategoryPayload;
    }) => productCategoryApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: PRODUCT_CATEGORY_KEYS.all });
        toast.success(TOAST_MSG.updateSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(
        getErrorMessage(error, TOAST_MSG.actionError("cập nhật", ENTITY)),
      );
    },
  });
}

export function useDeleteProductCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productCategoryApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: PRODUCT_CATEGORY_KEYS.all });
        toast.success(TOAST_MSG.deleteSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(error, TOAST_MSG.actionError("xóa", ENTITY)));
    },
  });
}

export function useDeleteProductCategoryMultiples() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => productCategoryApi.deleteMultiples({ ids }),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: PRODUCT_CATEGORY_KEYS.all });
        toast.success(TOAST_MSG.bulkDeleteSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(error, TOAST_MSG.actionError("xóa", ENTITY)));
    },
  });
}

export function useDeletedProductCategories(
  params: PageRequest,
  enabled = true,
) {
  return useQuery({
    queryKey: PRODUCT_CATEGORY_KEYS.deletedList(params),
    queryFn: () => productCategoryApi.getAllDeleted(params),
    enabled,
  });
}

export function useRestoreProductCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      productCategoryApi.update(id, { status: StatusActive.Active }),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: PRODUCT_CATEGORY_KEYS.all });
        toast.success(TOAST_MSG.restoreSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(
        getErrorMessage(error, TOAST_MSG.actionError("khôi phục", ENTITY)),
      );
    },
  });
}
