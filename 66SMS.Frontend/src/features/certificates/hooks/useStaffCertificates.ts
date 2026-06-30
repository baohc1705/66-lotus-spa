import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { certificateApi } from "../api/certificate.api";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import type {
  StaffCertificateQueryParams,
  CreateStaffCertificatePayload,
  UpdateStaffCertificatePayload,
} from "../types/certificate.types";
import type { Result } from "@/shared/types/common.types";

const KEYS = {
  all: ["staff-certificates"] as const,
  lists: () => [...KEYS.all, "list"] as const,
  list: (params: StaffCertificateQueryParams) => [...KEYS.lists(), params] as const,
  details: () => [...KEYS.all, "detail"] as const,
  detail: (id: number) => [...KEYS.details(), id] as const,
};

export function useStaffCertificates(params: StaffCertificateQueryParams) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => certificateApi.getAll(params),
  });
}

export function useStaffCertificateDetail(id: number | null) {
  return useQuery({
    queryKey: KEYS.detail(id!),
    queryFn: () => certificateApi.getDetail(id!),
    enabled: id !== null && id > 0,
  });
}

export function useCreateStaffCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStaffCertificatePayload) =>
      certificateApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: KEYS.lists() });
        toast.success("Thêm chứng chỉ thành công");
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) =>
      toast.error(getErrorMessage(error)),
  });
}

export function useUpdateStaffCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateStaffCertificatePayload }) =>
      certificateApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: KEYS.all });
        toast.success("Cập nhật chứng chỉ thành công");
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) =>
      toast.error(getErrorMessage(error)),
  });
}

export function useDeleteStaffCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => certificateApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: KEYS.all });
        toast.success("Xóa chứng chỉ thành công");
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) =>
      toast.error(getErrorMessage(error)),
  });
}
