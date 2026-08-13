import { type PageRequest, type Result } from "@/shared/types/common.types";
import { createEntityQueryKeys } from "@/shared/utils/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productCategoryDemoApi } from "../api/productCategoryDemo.api";
import type {
  CreateProductCategoryPayloadDemo,
  UpdateProductCategoryPayloadDemo,
} from "../schemas/productCategoryDemo.schema";
import { toast } from "@/shared/components/kitToast";
import type { AxiosError } from "axios";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import type { DeleteProductCategoryMultiplesPayloadDemo } from "../types/productCategoryDemo.type";
import { StatusActive } from "@/shared/constants/status.enum";

export const PRODUCT_CATEGORY_KEYS = createEntityQueryKeys<PageRequest>(
  "product-categories-demo",
);

export function useProductCategoriesDemo(
  params: PageRequest,
  enabled: boolean,
) {
  return useQuery({
    queryKey: PRODUCT_CATEGORY_KEYS.list(params),
    queryFn: () => productCategoryDemoApi.getAll(params),
    enabled,
  });
}

export function useProductCategoryDetailDemo(id: number | null) {
  return useQuery({
    queryKey: PRODUCT_CATEGORY_KEYS.detail(id!),
    queryFn: () => productCategoryDemoApi.getDetail(id!),
    enabled: id !== null && id > 0,
  });
}

export function useCreateProductCategoryDemo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductCategoryPayloadDemo) =>
      productCategoryDemoApi.create(payload),
    onSuccess: (res) => {
      if (!res.isSuccess) {
        toast.error(res.message || "Failed to create product category");
      }
      queryClient.invalidateQueries({
        queryKey: PRODUCT_CATEGORY_KEYS.lists(),
      });
      toast.success("Product category created successfully");
    },
    onError: (err: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useUpdateProductCategoryDemo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateProductCategoryPayloadDemo;
    }) => productCategoryDemoApi.update(id, payload),
    onSuccess: (res) => {
      if (!res.isSuccess) {
        toast.error(res.message || "Failed to update product category");
      }
      queryClient.invalidateQueries({ queryKey: PRODUCT_CATEGORY_KEYS.all });
      toast.success("Product category updated successfully");
    },
    onError: (err: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useDeleteProductCategoryDemo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productCategoryDemoApi.delete(id),
    onSuccess: (res) => {
      if (!res.isSuccess) {
        toast.error(res.message || "Failed to delete product category");
      }
      queryClient.invalidateQueries({ queryKey: PRODUCT_CATEGORY_KEYS.all });
      toast.success("Product category deleted successfully");
    },
    onError: (err: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useDeleteProductCategorBulkDemo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DeleteProductCategoryMultiplesPayloadDemo) =>
      productCategoryDemoApi.deleteMultiples(payload),
    onSuccess: (res) => {
      if (!res.isSuccess) {
        toast.error(res.message || "Failed to delete product categories");
      }
      queryClient.invalidateQueries({ queryKey: PRODUCT_CATEGORY_KEYS.all });
      toast.success("Product categories deleted successfully");
    },
  });
}

export function useDeletedProductCategoriesDemo(
  params: PageRequest,
  enabled = true,
) {
  return useQuery({
    queryKey: PRODUCT_CATEGORY_KEYS.deletedList(params),
    queryFn: () => productCategoryDemoApi.getAllDeleted(params),
    enabled,
  });
}

export function useRestoreProductCategoryDemo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      productCategoryDemoApi.update(id, { status: StatusActive.Active }),
    onSuccess: (res) => {
      if (!res.isSuccess) {
        toast.error(res.message || "Failed to restore product category");
      }
      queryClient.invalidateQueries({ queryKey: PRODUCT_CATEGORY_KEYS.all });
      toast.success("Product category restored successfully");
    },
    onError: (err: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(err));
    },
  });
}
