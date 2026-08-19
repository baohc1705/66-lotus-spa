import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/utils/kitToast";
import type { AxiosError } from "axios";
import { certificateApi } from "../api/certificate.api";
import type {
  CertificateTypeQueryParams,
  CreateCertificateTypePayload,
  UpdateCertificateTypePayload,
} from "../types/certificate.types";
import type { Result } from "@/shared/types/common.types";
import { getErrorMessage } from "@/shared/utils/errorUtils";

const ENTITY = "loại chứng chỉ";

const CERTIFICATE_TYPE_KEYS = {
  all: ["certificate-types"] as const,
  lists: () => [...CERTIFICATE_TYPE_KEYS.all, "list"] as const,
  list: (params: CertificateTypeQueryParams) =>
    [...CERTIFICATE_TYPE_KEYS.lists(), params] as const,
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

export function useUpdateCertificateType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateCertificateTypePayload;
    }) => certificateApi.updateType(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: CERTIFICATE_TYPE_KEYS.all });
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

export function useDeleteCertificateType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => certificateApi.deleteType(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: CERTIFICATE_TYPE_KEYS.all });
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
