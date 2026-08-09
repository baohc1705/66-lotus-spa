import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/components/kitToast";
import type { AxiosError } from "axios";
import { certificateApi } from "../api/certificate.api";
import type {
  StaffCertificateQueryParams,
  CreateStaffCertificatePayload,
  UpdateStaffCertificatePayload,
} from "../types/certificate.types";
import type { Result } from "@/shared/types/common.types";
import { getErrorMessage } from "@/shared/utils/errorUtils";

const ENTITY = "chứng chỉ";

const STAFF_CERTIFICATE_KEYS = {
  all: ["staff-certificates"] as const,
  lists: () => [...STAFF_CERTIFICATE_KEYS.all, "list"] as const,
  list: (params: StaffCertificateQueryParams) =>
    [...STAFF_CERTIFICATE_KEYS.lists(), params] as const,
  details: () => [...STAFF_CERTIFICATE_KEYS.all, "detail"] as const,
  detail: (id: number) => [...STAFF_CERTIFICATE_KEYS.details(), id] as const,
};

export function useStaffCertificates(params: StaffCertificateQueryParams) {
  return useQuery({
    queryKey: STAFF_CERTIFICATE_KEYS.list(params),
    queryFn: () => certificateApi.getAll(params),
  });
}

export function useStaffCertificateDetail(id: number | null) {
  return useQuery({
    queryKey: STAFF_CERTIFICATE_KEYS.detail(id!),
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
        qc.invalidateQueries({ queryKey: STAFF_CERTIFICATE_KEYS.lists() });
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

export function useUpdateStaffCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateStaffCertificatePayload;
    }) => certificateApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: STAFF_CERTIFICATE_KEYS.all });
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

export function useDeleteStaffCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => certificateApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: STAFF_CERTIFICATE_KEYS.all });
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
