import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { certificateApi } from "../api/certificate.api";
import type {
  CertificateTypeQueryParams,
  CreateCertificateTypePayload,
  UpdateCertificateTypePayload,
} from "../types/certificate.types";
import type { Result } from "@/shared/types/common.types";
import { TOAST_MSG } from "@/shared/constants/toast.messages";
import { COMMON_MSG } from "@/shared/constants/common.messages";

const ENTITY = "loại chứng chỉ";

const CERTIFICATE_TYPE_KEYS = {
  all: ["certificate-types"] as const,
  lists: () => [...CERTIFICATE_TYPE_KEYS.all, "list"] as const,
  list: (params: CertificateTypeQueryParams) => [...CERTIFICATE_TYPE_KEYS.lists(), params] as const,
  details: () => [...CERTIFICATE_TYPE_KEYS.all, "detail"] as const,
  detail: (id: number) => [...CERTIFICATE_TYPE_KEYS.details(), id] as const,
};

export function useCertificateTypes(params: CertificateTypeQueryParams) {
  return useQuery({
    queryKey: CERTIFICATE_TYPE_KEYS.list(params),
    queryFn: () => certificateApi.getAllTypes(params),
  });
}

export function useCertificateTypeDetail(id: number | null) {
  return useQuery({
    queryKey: CERTIFICATE_TYPE_KEYS.detail(id!),
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
        qc.invalidateQueries({ queryKey: CERTIFICATE_TYPE_KEYS.lists() });
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

export function useUpdateCertificateType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCertificateTypePayload }) =>
      certificateApi.updateType(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: CERTIFICATE_TYPE_KEYS.all });
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

export function useDeleteCertificateType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => certificateApi.deleteType(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: CERTIFICATE_TYPE_KEYS.all });
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
