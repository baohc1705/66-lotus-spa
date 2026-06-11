import { scheduleApi } from "@/features/schedules/api/schedule.api";
import type { PageRequest } from "@/shared/types/common.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CreateWorkSchedulePayload,
  UpdateWorkSchedulePayload,
} from "../types/schedule.types";

const SCHEDULE_KEYS = {
  all: ["schedules"] as const,
  lists: () => [...SCHEDULE_KEYS.all, "list"] as const,
  list: (params: PageRequest) => [...SCHEDULE_KEYS.lists(), params] as const,
  details: () => [...SCHEDULE_KEYS.all, "detail"] as const,
  detail: (id: number) => [...SCHEDULE_KEYS.details(), id] as const,
};

export function useWorkSchedules(params: PageRequest) {
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
    onError: () => {
      toast.error("Có lỗi xảy ra khi tạo lịch làm việc");
    },
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
    onError: () => {
      toast.error("Có lỗi xảy ra khi cập nhật lịch làm việc");
    },
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
    onError: () => {
      toast.error("Có lỗi xảy ra khi xóa lịch làm việc");
    },
  });
}
