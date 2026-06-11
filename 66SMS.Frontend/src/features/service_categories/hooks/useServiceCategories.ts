import { serviceCategoryApi } from "@/features/service_categories/api/serviceCategory.api";
import type { PageRequest } from "@/shared/types/common.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CreateServiceCategoryPayload,
  UpdateServiceCategoryPayload,
} from "../types/service_category.types";

const SERVICE_CATEGORY_KEYS = {
  all: ["service-categories"] as const,
  lists: () => [...SERVICE_CATEGORY_KEYS.all, "list"] as const,
  list: (params: PageRequest) =>
    [...SERVICE_CATEGORY_KEYS.lists(), params] as const,
  details: () => [...SERVICE_CATEGORY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...SERVICE_CATEGORY_KEYS.details(), id] as const,
};

export function useServiceCategories(params: PageRequest) {
  return useQuery({
    queryKey: SERVICE_CATEGORY_KEYS.list(params),
    queryFn: () => serviceCategoryApi.getAll(params),
  });
}

export function useServiceCategoryDetail(id: number | null) {
  return useQuery({
    queryKey: SERVICE_CATEGORY_KEYS.detail(id!),
    queryFn: () => serviceCategoryApi.getDetail(id!),
    enabled: id !== null && id > 0,
  });
}

export function useCreateServiceCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateServiceCategoryPayload) =>
      serviceCategoryApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SERVICE_CATEGORY_KEYS.lists() });
        toast.success("Tạo nhóm dịch vụ thành công");
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi tạo nhóm dịch vụ");
    },
  });
}

export function useUpdateServiceCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateServiceCategoryPayload;
    }) => serviceCategoryApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SERVICE_CATEGORY_KEYS.all });
        toast.success("Cập nhật nhóm dịch vụ thành công");
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi cập nhật nhóm dịch vụ");
    },
  });
}

export function useDeleteServiceCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => serviceCategoryApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SERVICE_CATEGORY_KEYS.all });
        toast.success("Xóa nhóm dịch vụ thành công");
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi xóa nhóm dịch vụ");
    },
  });
}
