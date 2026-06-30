import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { certificateApi } from "../api/certificate.api";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import type {
  CertificateTypeQueryParams,
  CreateCertificateTypePayload,
  UpdateCertificateTypePayload,
} from "../types/certificate.types";
import type { Result } from "@/shared/types/common.types";

const KEYS = {
  all: ["certificate-types"] as const,
  lists: () => [...KEYS.all, "list"] as const,
  list: (params: CertificateTypeQueryParams) => [...KEYS.lists(), params] as const,
  details: () => [...KEYS.all, "detail"] as const,
  detail: (id: number) => [...KEYS.details(), id] as const,
};

export function useCertificateTypes(params: CertificateTypeQueryParams) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => certificateApi.getAllTypes(params),
  });
}

export function useCertificateTypeDetail(id: number | null) {
  return useQuery({
    queryKey: KEYS.detail(id!),
    queryFn: () => certificateApi.getDetailType(id!),
    enabled: id !== null && id > 0,
  });
}

export function useCreateCertificateType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCertificateTypePayload) =>
      certificateApi.createType(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: KEYS.lists() });
        toast.success("Tạo loại chứng chỉ thành công");
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) =>
      toast.error(getErrorMessage(error)),
  });
}

export function useUpdateCertificateType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCertificateTypePayload }) =>
      certificateApi.updateType(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: KEYS.all });
        toast.success("Cập nhật loại chứng chỉ thành công");
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) =>
      toast.error(getErrorMessage(error)),
  });
}

export function useDeleteCertificateType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => certificateApi.deleteType(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: KEYS.all });
        toast.success("Xóa loại chứng chỉ thành công");
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) =>
      toast.error(getErrorMessage(error)),
  });
}
