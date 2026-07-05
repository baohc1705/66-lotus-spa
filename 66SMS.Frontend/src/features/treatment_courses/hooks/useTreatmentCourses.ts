import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { treatmentCourseApi } from "../api/treatmentCourse.api";
import type { PageRequest, Result } from "@/shared/types/common.types";
import { StatusActive } from "@/shared/constants/status.enum";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { TOAST_MSG } from "@/shared/constants/toast.messages";
import type {
  CreateTreatmentCoursePayload,
  UpdateTreatmentCoursePayload,
} from "../types/treatmentCourse.types";

const ENTITY = "liệu trình";

const KEYS = {
  all: ["treatment-courses"] as const,
  lists: () => [...KEYS.all, "list"] as const,
  list: (params: PageRequest) => [...KEYS.lists(), params] as const,
  deletedLists: () => [...KEYS.all, "deleted"] as const,
  deletedList: (params: PageRequest) => [...KEYS.deletedLists(), params] as const,
  details: () => [...KEYS.all, "detail"] as const,
  detail: (id: number) => [...KEYS.details(), id] as const,
};

export function useTreatmentCourses(params: PageRequest, enabled = true) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => treatmentCourseApi.getAll(params),
    enabled,
  });
}

export function useAdminTreatmentCourses(params: PageRequest, enabled = true) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => treatmentCourseApi.adminGetAll(params),
    enabled,
  });
}

export function useDeletedTreatmentCourses(params: PageRequest, enabled = true) {
  return useQuery({
    queryKey: KEYS.deletedList(params),
    queryFn: () => treatmentCourseApi.getAllDeleted(params),
    enabled,
  });
}

export function useTreatmentCourseDetail(id: number | null) {
  return useQuery({
    queryKey: KEYS.detail(id!),
    queryFn: () => treatmentCourseApi.getDetail(id!),
    enabled: id !== null && id > 0,
  });
}

export function useCreateTreatmentCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTreatmentCoursePayload) =>
      treatmentCourseApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: KEYS.lists() });
        toast.success(TOAST_MSG.createSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      const msg = error.response?.data?.message ?? TOAST_MSG.actionError("tạo", ENTITY);
      toast.error(msg);
    },
  });
}

export function useUpdateTreatmentCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateTreatmentCoursePayload;
    }) => treatmentCourseApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: KEYS.all });
        toast.success(TOAST_MSG.updateSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      const msg = error.response?.data?.message ?? TOAST_MSG.actionError("cập nhật", ENTITY);
      toast.error(msg);
    },
  });
}

export function useDeleteTreatmentCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => treatmentCourseApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: KEYS.all });
        toast.success(TOAST_MSG.deleteSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      const msg = error.response?.data?.message ?? TOAST_MSG.actionError("xóa", ENTITY);
      toast.error(msg);
    },
  });
}

export function useDeleteTreatmentCourseMultiples() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => treatmentCourseApi.deleteMultiples({ ids }),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: KEYS.all });
        toast.success(TOAST_MSG.bulkDeleteSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      const msg = error.response?.data?.message ?? TOAST_MSG.actionError("xóa", ENTITY);
      toast.error(msg);
    },
  });
}

export function useRestoreTreatmentCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      treatmentCourseApi.update(id, { status: StatusActive.Active }),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: KEYS.all });
        toast.success(TOAST_MSG.restoreSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      const msg = error.response?.data?.message ?? TOAST_MSG.actionError("khôi phục", ENTITY);
      toast.error(msg);
    },
  });
}
