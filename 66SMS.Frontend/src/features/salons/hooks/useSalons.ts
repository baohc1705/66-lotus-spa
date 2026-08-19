import { createEntityQueryKeys } from "@/shared/utils/queryKeys";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/utils/kitToast";
import type { AxiosError } from "axios";
import { salonApi } from "../api/salon.api";
import type {
  SalonQueryParams,
  CreateSalonPayload,
  UpdateSalonPayload,
} from "../types/salon.types";
import type { Result } from "@/shared/types/common.types";

const ENTITY = "chi nhánh";

export const SALON_KEYS = createEntityQueryKeys<SalonQueryParams>("salons");

export function useSalons(params: SalonQueryParams, enabled = true) {
  return useQuery({
    queryKey: SALON_KEYS.list(params),
    queryFn: () => salonApi.getAll(params),
    enabled,
  });
}

export function useAdminSalons(params: SalonQueryParams, enabled = true) {
  return useQuery({
    queryKey: SALON_KEYS.adminList(params),
    queryFn: () => salonApi.getAdminAll(params),
    enabled,
  });
}

export function useSalonDetail(id: number | null) {
  return useQuery({
    queryKey: SALON_KEYS.detail(id!),
    queryFn: () => salonApi.getDetail(id!),
    enabled: id !== null && id > 0,
  });
}

export function useCreateSalonMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSalonPayload) => salonApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SALON_KEYS.all });
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

export function useUpdateSalonMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateSalonPayload;
    }) => salonApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SALON_KEYS.all });
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

export function useDeleteSalonMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => salonApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SALON_KEYS.all });
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
