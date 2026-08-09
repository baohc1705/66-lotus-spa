import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/components/kitToast";
import type { AxiosError } from "axios";
import { treatmentCourseApi } from "../api/treatmentCourse.api";
import type { PageRequest, Result } from "@/shared/types/common.types";
import { StatusActive } from "@/shared/constants/status.enum";
import { createEntityQueryKeys } from "@/shared/utils/queryKeys";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import type {
  CreateTreatmentCoursePayload,
  UpdateTreatmentCoursePayload,
} from "../types/treatmentCourse.types";

const ENTITY = "liệu trình";

export const TREATMENT_COURSE_KEYS =
  createEntityQueryKeys<PageRequest>("treatment-courses");

export function useTreatmentCourses(params: PageRequest, enabled = true) {
  return useQuery({
    queryKey: TREATMENT_COURSE_KEYS.list(params),
    queryFn: () => treatmentCourseApi.getAll(params),
    enabled,
  });
}

export function useAdminTreatmentCourses(params: PageRequest, enabled = true) {
  return useQuery({
    queryKey: TREATMENT_COURSE_KEYS.adminList(params),
    queryFn: () => treatmentCourseApi.adminGetAll(params),
    enabled,
  });
}

export function useDeletedTreatmentCourses(
  params: PageRequest,
  enabled = true,
) {
  return useQuery({
    queryKey: TREATMENT_COURSE_KEYS.deletedList(params),
    queryFn: () => treatmentCourseApi.getAllDeleted(params),
    enabled,
  });
}

export function useTreatmentCourseDetail(id: number | null) {
  return useQuery({
    queryKey: TREATMENT_COURSE_KEYS.detail(id!),
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
        qc.invalidateQueries({ queryKey: TREATMENT_COURSE_KEYS.all });
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
        qc.invalidateQueries({ queryKey: TREATMENT_COURSE_KEYS.all });
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

export function useDeleteTreatmentCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => treatmentCourseApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: TREATMENT_COURSE_KEYS.all });
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

export function useDeleteTreatmentCourseMultiples() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => treatmentCourseApi.deleteMultiples({ ids }),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: TREATMENT_COURSE_KEYS.all });
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

export function useRestoreTreatmentCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      treatmentCourseApi.update(id, { status: StatusActive.Active }),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: TREATMENT_COURSE_KEYS.all });
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
