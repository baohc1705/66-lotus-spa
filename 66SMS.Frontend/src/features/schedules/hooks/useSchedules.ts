import { scheduleApi } from "@/features/schedules/api/schedule.api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import type { Result } from "@/shared/types/common.types";
import type {
  CreateWorkSchedulePayload,
  UpdateWorkSchedulePayload,
  GetWorkSchedulesParams,
} from "../types/schedule.types";

const SCHEDULE_KEYS = {
  all: ["schedules"] as const,
  lists: () => [...SCHEDULE_KEYS.all, "list"] as const,
  list: (params: GetWorkSchedulesParams) =>
    [...SCHEDULE_KEYS.lists(), params] as const,
  details: () => [...SCHEDULE_KEYS.all, "detail"] as const,
  detail: (id: number) => [...SCHEDULE_KEYS.details(), id] as const,
};

export function useWorkSchedules(params: GetWorkSchedulesParams) {
  return useQuery({
    queryKey: SCHEDULE_KEYS.list(params),
    queryFn: () => scheduleApi.getAll(params),
  });
}

export function useWorkScheduleDetail(id: number | null) {
  return useQuery({
    queryKey: SCHEDULE_KEYS.detail(id!),
    queryFn: () => scheduleApi.getDetail(id!),
    enabled: id !== null && id > 0,
  });
}

export function useCreateWorkSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWorkSchedulePayload) =>
      scheduleApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SCHEDULE_KEYS.lists() });
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) =>
      toast.error(getErrorMessage(error)),
  });
}

export function useBulkCreateWorkSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      payload: import("../types/schedule.types").BulkCreateWorkSchedulePayload,
    ) => scheduleApi.bulkCreate(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SCHEDULE_KEYS.lists() });
        toast.success("Phân lịch thành công");
      } else {
        toast.error(result.message || "Không thể phân ca làm việc");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) =>
      toast.error(getErrorMessage(error)),
  });
}

export function useUpdateWorkSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateWorkSchedulePayload;
    }) => scheduleApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SCHEDULE_KEYS.all });
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) =>
      toast.error(getErrorMessage(error)),
  });
}

export function useDeleteWorkSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => scheduleApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SCHEDULE_KEYS.all });
        toast.success("Xóa lịch làm việc thành công");
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) =>
      toast.error(getErrorMessage(error)),
  });
}
