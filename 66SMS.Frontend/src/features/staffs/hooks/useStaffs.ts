import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { staffApi } from "../api/staff.api";
import { TOAST_MSG } from "@/shared/constants/toast.messages";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import type { PageRequest, Result } from "@/shared/types/common.types";
import type { CreateStaffPayload, UpdateStaffPayload } from "../types/staff.types";
import { getErrorMessage } from "@/shared/utils/errorUtils";

const ENTITY = "nhân viên";

type StaffParams = PageRequest & { salonId?: number | null; role?: string | null };

export const STAFF_KEYS = {
  all: ["staffs"] as const,
  lists: () => [...STAFF_KEYS.all, "list"] as const,
  list: (params: StaffParams) =>
    [...STAFF_KEYS.lists(), params] as const,
  adminLists: () => [...STAFF_KEYS.all, "adminList"] as const,
  adminList: (params: StaffParams) =>
    [...STAFF_KEYS.adminLists(), params] as const,
  details: () => [...STAFF_KEYS.all, "detail"] as const,
  detail: (id: number) => [...STAFF_KEYS.details(), id] as const,
};

export function useStaffs(
  params: StaffParams,
  enabled = true
) {
  return useQuery({
    queryKey: STAFF_KEYS.list(params),
    queryFn: () => staffApi.getAll(params),
    enabled,
  });
}

export function useAdminStaffs(
  params: StaffParams,
  enabled = true
) {
  return useQuery({
    queryKey: STAFF_KEYS.adminList(params),
    queryFn: () => staffApi.adminGetAll(params),
    enabled,
  });
}

export function useStaffDetail(id: number | null) {
  return useQuery({
    queryKey: STAFF_KEYS.detail(id!),
    queryFn: () => staffApi.getDetail(id!),
    enabled: id !== null && id > 0,
  });
}

export function useCreateStaffMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStaffPayload) => staffApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: STAFF_KEYS.lists() });
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

export function useUpdateStaffMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateStaffPayload }) =>
      staffApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: STAFF_KEYS.all });
        toast.success(TOAST_MSG.updateSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(error, TOAST_MSG.actionError("cập nhật", ENTITY)));
    },
  });
}

export function useDeleteStaffMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => staffApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: STAFF_KEYS.lists() });
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
