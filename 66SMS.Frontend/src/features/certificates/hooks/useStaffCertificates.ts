import { certificateApi } from "@/features/certificates/api/certificate.api";
import type {
  CreateStaffCertificateRequest,
  GetAllStaffCertificateQuery,
  UpdateStaffCertificateRequest,
} from "@/features/certificates/types/certificate.types";
import type { Result } from "@/shared/types/common.types";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { showError, showSuccess } from "@/shared/utils/kitToast";
import { createEntityQueryKeys } from "@/shared/utils/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

// Query keys cho chứng chỉ nhân viên
export const STAFF_CERTIFICATE_QUERY_KEY =
  createEntityQueryKeys<GetAllStaffCertificateQuery>("staff-certificates");

// Lấy danh sách chứng chỉ nhân viên
export function useStaffCertificates(params: GetAllStaffCertificateQuery, enabled = true) {
  return useQuery({
    queryKey: STAFF_CERTIFICATE_QUERY_KEY.list(params),
    queryFn: () => certificateApi.getAll(params),
    enabled,
  });
}

// Lấy chi tiết chứng chỉ nhân viên
export function useStaffCertificateDetail(id?: number | null) {
  return useQuery({
    queryKey: STAFF_CERTIFICATE_QUERY_KEY.detail(id ?? 0),
    queryFn: () => certificateApi.getDetail(id!),
    enabled: id != null && id > 0,
  });
}

// Tạo chứng chỉ nhân viên
export function useCreateStaffCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStaffCertificateRequest) => certificateApi.create(data),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }
      queryClient.invalidateQueries({ queryKey: STAFF_CERTIFICATE_QUERY_KEY.all });
      showSuccess("Tạo chứng chỉ thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi tạo chứng chỉ"));
    },
  });
}

// Nhân viên tự nộp chứng chỉ
export function useCreateMineCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<CreateStaffCertificateRequest, "staffId" | "status">) =>
      certificateApi.createMine(data),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }
      queryClient.invalidateQueries({ queryKey: STAFF_CERTIFICATE_QUERY_KEY.all });
      showSuccess("Nộp chứng chỉ thành công. Chờ quản lý duyệt.");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi nộp chứng chỉ"));
    },
  });
}

// Sửa chứng chỉ nhân viên
export function useUpdateStaffCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStaffCertificateRequest }) =>
      certificateApi.update(id, data),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }
      queryClient.invalidateQueries({ queryKey: STAFF_CERTIFICATE_QUERY_KEY.all });
      showSuccess("Cập nhật chứng chỉ thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi cập nhật chứng chỉ"));
    },
  });
}

// Xóa chứng chỉ nhân viên
export function useDeleteStaffCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => certificateApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }
      queryClient.invalidateQueries({ queryKey: STAFF_CERTIFICATE_QUERY_KEY.all });
      showSuccess("Xóa chứng chỉ thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi xóa chứng chỉ"));
    },
  });
}
