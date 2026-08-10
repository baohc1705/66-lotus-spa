import { productApi } from "@/features/products/api/product.api";
import type { PageRequest, Result } from "@/shared/types/common.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/components/kitToast";
import type { AxiosError } from "axios";
import { StatusActive } from "@/shared/constants/status.enum";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { createEntityQueryKeys } from "@/shared/utils/queryKeys";
import type {
  CreateProductPayload,
  UpdateProductPayload,
} from "../types/product.types";

const ENTITY = "sản phẩm";

type ProductParams = PageRequest & { categoryId?: number };

export const PRODUCT_KEYS = createEntityQueryKeys<ProductParams>("products");

export function useProducts(params: ProductParams) {
  return useQuery({
    queryKey: PRODUCT_KEYS.list(params),
    queryFn: () => productApi.getAll(params),
  });
}

export function useAdminProducts(params: ProductParams, enabled = true) {
  return useQuery({
    queryKey: PRODUCT_KEYS.adminList(params),
    queryFn: () => productApi.adminGetAll(params),
    enabled,
  });
}

export function useDeletedProducts(params: ProductParams, enabled = true) {
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
        qc.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
        toast.success(`Tạo ${ENTITY} thành công`);
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(error, `Có lỗi xảy ra khi tạo ${ENTITY}`));
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
        toast.success(`Cập nhật ${ENTITY} thành công`);
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(
        getErrorMessage(error, `Có lỗi xảy ra khi cập nhật ${ENTITY}`),
      );
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
        toast.success(`Xóa ${ENTITY} thành công`);
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(error, `Có lỗi xảy ra khi xóa ${ENTITY}`));
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
        toast.success(`Xóa ${ENTITY} đã chọn thành công`);
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(error, `Có lỗi xảy ra khi xóa ${ENTITY}`));
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
        toast.success(`Khôi phục ${ENTITY} thành công`);
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(
        getErrorMessage(error, `Có lỗi xảy ra khi khôi phục ${ENTITY}`),
      );
    },
  });
}
