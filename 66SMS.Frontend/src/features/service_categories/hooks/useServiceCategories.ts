import { serviceCategoryApi } from "@/features/service_categories/api/serviceCategory.api";
import type { PageRequest, Result } from "@/shared/types/common.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { TOAST_MSG } from "@/shared/constants/toast.messages";
import { StatusActive } from "@/shared/constants/status.enum";
import { createEntityQueryKeys } from "@/shared/utils/queryKeys";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import type {
  CreateServiceCategoryPayload,
  UpdateServiceCategoryPayload,
} from "../types/serviceCategory.types";

const ENTITY = "nhóm dịch vụ";

export const SERVICE_CATEGORY_KEYS =
  createEntityQueryKeys<PageRequest>("service-categories");

export function useServiceCategories(params: PageRequest, enabled = true) {
  return useQuery({
    queryKey: SERVICE_CATEGORY_KEYS.list(params),
    queryFn: () => serviceCategoryApi.getAll(params),
    enabled,
  });
}

export function useAdminServiceCategories(params: PageRequest, enabled = true) {
  return useQuery({
    queryKey: SERVICE_CATEGORY_KEYS.adminList(params),
    queryFn: () => serviceCategoryApi.adminGetAll(params),
    enabled,
  });
}

export function useDeletedServiceCategories(
  params: PageRequest,
  enabled = true,
) {
  return useQuery({
    queryKey: SERVICE_CATEGORY_KEYS.deletedList(params),
    queryFn: () => serviceCategoryApi.getAllDeleted(params),
    enabled,
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
        qc.invalidateQueries({ queryKey: SERVICE_CATEGORY_KEYS.all });
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

export function useDeleteServiceCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => serviceCategoryApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SERVICE_CATEGORY_KEYS.all });
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

export function useDeleteServiceCategoryMultiples() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => serviceCategoryApi.deleteMultiples({ ids }),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SERVICE_CATEGORY_KEYS.all });
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

export function useRestoreServiceCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      serviceCategoryApi.update(id, { status: StatusActive.Active }),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SERVICE_CATEGORY_KEYS.all });
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
