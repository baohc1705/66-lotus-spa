import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { certificateApi } from "../api/certificate.api";
import type {
  StaffCertificateQueryParams,
  CreateStaffCertificatePayload,
  UpdateStaffCertificatePayload,
} from "../types/certificate.types";
import type { Result } from "@/shared/types/common.types";
import { TOAST_MSG } from "@/shared/constants/toast.messages";
import { COMMON_MSG } from "@/shared/constants/common.messages";
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

export function useDeleteStaffCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => certificateApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: STAFF_CERTIFICATE_KEYS.all });
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
