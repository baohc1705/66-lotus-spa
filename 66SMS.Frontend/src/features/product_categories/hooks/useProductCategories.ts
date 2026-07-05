import { productCategoryApi } from "@/features/product_categories/api/productCategory.api";
import type { PageRequest } from "@/shared/types/common.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { TOAST_MSG } from "@/shared/constants/toast.messages";
import { StatusActive } from "@/shared/constants/status.enum";
import type {
  CreateProductCategoryPayload,
  UpdateProductCategoryPayload,
} from "../schemas/productCategory.schema";

const ENTITY = "danh mục";
const ENTITY_ERROR = "danh mục sản phẩm";

const PRODUCT_CATEGORY_KEYS = {
  all: ["product-categories"] as const,
  lists: () => [...PRODUCT_CATEGORY_KEYS.all, "list"] as const,
  list: (params: PageRequest) =>
    [...PRODUCT_CATEGORY_KEYS.lists(), params] as const,
  deletedLists: () => [...PRODUCT_CATEGORY_KEYS.all, "deleted"] as const,
  deletedList: (params: PageRequest) =>
    [...PRODUCT_CATEGORY_KEYS.deletedLists(), params] as const,
  details: () => [...PRODUCT_CATEGORY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...PRODUCT_CATEGORY_KEYS.details(), id] as const,
};

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
    onError: () => {
      toast.error(TOAST_MSG.actionError("tạo", ENTITY_ERROR));
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
    onError: () => {
      toast.error(TOAST_MSG.actionError("cập nhật", ENTITY_ERROR));
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
    onError: () => {
      toast.error(TOAST_MSG.actionError("xóa", ENTITY_ERROR));
    },
  });
}

export function useDeleteProductCategoryMultiples() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) =>
      productCategoryApi.deleteMultiples({ ids }),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: PRODUCT_CATEGORY_KEYS.all });
        toast.success(TOAST_MSG.bulkDeleteSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: () => {
      toast.error(TOAST_MSG.actionError("xóa", ENTITY));
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
    onError: () => {
      toast.error(TOAST_MSG.actionError("khôi phục", ENTITY));
    },
  });
}
