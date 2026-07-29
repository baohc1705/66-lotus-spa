import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { staffApi } from "../api/staff.api";
import { TOAST_MSG } from "@/shared/constants/toast.messages";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import type { PageRequest, Result } from "@/shared/types/common.types";
import type {
  CreateStaffPayload,
  UpdateStaffPayload,
  CreateStaffServicePayload,
  UpdateStaffServicePayload,
} from "../types/staff.types";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { createEntityQueryKeys } from "@/shared/utils/queryKeys";

const ENTITY = "nhân viên";
const STAFF_SERVICE_ENTITY = "phân công dịch vụ";

type StaffParams = PageRequest & {
  salonId?: number | null;
  role?: string | null;
};
type StaffServiceParams = PageRequest & {
  staffId?: number | null;
  serviceId?: number | null;
};

export const STAFF_KEYS = createEntityQueryKeys<PageRequest>("staffs");

export const STAFF_SERVICE_KEYS = {
  all: ["staff-services"] as const,
  lists: () => [...STAFF_SERVICE_KEYS.all, "list"] as const,
  list: (params: StaffServiceParams) =>
    [...STAFF_SERVICE_KEYS.lists(), params] as const,
};

export function useStaffs(params: StaffParams, enabled = true) {
  return useQuery({
    queryKey: STAFF_KEYS.list(params),
    queryFn: () => staffApi.getAll(params),
    enabled,
  });
}

export function useAdminStaffs(params: StaffParams, enabled = true) {
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
        qc.invalidateQueries({ queryKey: STAFF_KEYS.all });
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
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateStaffPayload;
    }) => staffApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: STAFF_KEYS.all });
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

export function useDeleteStaffMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => staffApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: STAFF_KEYS.all });
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

export function useStaffServices(params: StaffServiceParams, enabled = true) {
  return useQuery({
    queryKey: STAFF_SERVICE_KEYS.list(params),
    queryFn: () => staffApi.getStaffServices(params),
    enabled,
  });
}

export function useCreateStaffServicesMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStaffServicePayload) =>
      staffApi.createStaffServices(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: STAFF_SERVICE_KEYS.all });
        toast.success("Phân công dịch vụ thành công");
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(
        getErrorMessage(
          error,
          TOAST_MSG.actionError("phân công", STAFF_SERVICE_ENTITY),
        ),
      );
    },
  });
}

export function useUpdateStaffServiceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateStaffServicePayload;
    }) => staffApi.updateStaffService(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: STAFF_SERVICE_KEYS.all });
        toast.success(TOAST_MSG.updateSuccess(STAFF_SERVICE_ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(
        getErrorMessage(
          error,
          TOAST_MSG.actionError("cập nhật", STAFF_SERVICE_ENTITY),
        ),
      );
    },
  });
}

export function useDeleteStaffServicesMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => staffApi.deleteStaffServices({ ids }),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: STAFF_SERVICE_KEYS.all });
        toast.success("Đã gỡ phân công dịch vụ");
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(
        getErrorMessage(
          error,
          TOAST_MSG.actionError("gỡ", STAFF_SERVICE_ENTITY),
        ),
      );
    },
  });
}
