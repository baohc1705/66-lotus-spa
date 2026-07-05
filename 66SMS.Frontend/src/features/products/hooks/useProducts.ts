import { productApi, productImageApi } from "@/features/products/api/product.api";
import type { PageRequest } from "@/shared/types/common.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { TOAST_MSG } from "@/shared/constants/toast.messages";
import { StatusActive } from "@/shared/constants/status.enum";
import type {
  CreateProductPayload,
  UpdateProductPayload,
  CreateProductImagePayload,
  UpdateProductImagePayload,
} from "../types/product.types";

const ENTITY = "sản phẩm";

const PRODUCT_KEYS = {
  all: ["products"] as const,
  lists: () => [...PRODUCT_KEYS.all, "list"] as const,
  list: (params: PageRequest) => [...PRODUCT_KEYS.lists(), params] as const,
  deletedLists: () => [...PRODUCT_KEYS.all, "deleted"] as const,
  deletedList: (params: PageRequest) =>
    [...PRODUCT_KEYS.deletedLists(), params] as const,
  details: () => [...PRODUCT_KEYS.all, "detail"] as const,
  detail: (id: number) => [...PRODUCT_KEYS.details(), id] as const,
};

export function useProducts(params: PageRequest) {
  return useQuery({
    queryKey: PRODUCT_KEYS.list(params),
    queryFn: () => productApi.getAll(params),
  });
}

export function useAdminProducts(params: PageRequest, enabled = true) {
  return useQuery({
    queryKey: PRODUCT_KEYS.list(params),
    queryFn: () => productApi.adminGetAll(params),
    enabled,
  });
}

export function useDeletedProducts(params: PageRequest, enabled = true) {
  return useQuery({
    queryKey: PRODUCT_KEYS.deletedList(params),
    queryFn: () => productApi.getAllDeleted(params),
    enabled,
  });
}

export function useProductDetail(id: number | null) {
  return useQuery({
    queryKey: PRODUCT_KEYS.detail(id!),
    queryFn: () => productApi.getDetail(id!),
    enabled: id !== null && id > 0,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductPayload) => productApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: PRODUCT_KEYS.lists() });
        toast.success(TOAST_MSG.createSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: () => {
      toast.error(TOAST_MSG.actionError("tạo", ENTITY));
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateProductPayload;
    }) => productApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
        toast.success(TOAST_MSG.updateSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: () => {
      toast.error(TOAST_MSG.actionError("cập nhật", ENTITY));
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
        toast.success(TOAST_MSG.deleteSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: () => {
      toast.error(TOAST_MSG.actionError("xóa", ENTITY));
    },
  });
}

export function useDeleteProductMultiples() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => productApi.deleteMultiples({ ids }),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
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

export function useRestoreProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      productApi.update(id, { status: StatusActive.Active }),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
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

export function useCreateProductImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductImagePayload) =>
      productImageApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
        toast.success(TOAST_MSG.subActionSuccess("Thêm", "ảnh"));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: () => {
      toast.error(TOAST_MSG.subActionError("thêm", "ảnh"));
    },
  });
}

export function useUpdateProductImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateProductImagePayload;
    }) => productImageApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
        toast.success(TOAST_MSG.subActionSuccess("Cập nhật", "ảnh"));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: () => {
      toast.error(TOAST_MSG.subActionError("cập nhật", "ảnh"));
    },
  });
}

export function useDeleteProductImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productImageApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
        toast.success(TOAST_MSG.subActionSuccess("Xóa", "ảnh"));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: () => {
      toast.error(TOAST_MSG.subActionError("xóa", "ảnh"));
    },
  });
}
