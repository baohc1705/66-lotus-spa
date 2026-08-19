import { certificateTypeApi } from "@/features/certificates/api/certificateType.api";

import type { Result } from "@/shared/types/common.types";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { showError, showSuccess } from "@/shared/utils/kitToast";
import { createEntityQueryKeys } from "@/shared/utils/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type {
  CreateCertificateTypeRequest,
  GetAllCertificateTypeQuery,
  UpdateCertificateTypeRequest,
} from "../types/certificateType.types";

// Query keys cho loại chứng chỉ
export const CERTIFICATE_TYPE_QUERY_KEY =
  createEntityQueryKeys<GetAllCertificateTypeQuery>("certificate-types");

// Lấy danh sách loại chứng chỉ
export function useCertificateTypes(
  params: GetAllCertificateTypeQuery,
  enabled = true,
) {
  return useQuery({
    queryKey: CERTIFICATE_TYPE_QUERY_KEY.list(params),
    queryFn: () => certificateTypeApi.getAllTypes(params),
    enabled,
  });
}

// Lấy chi tiết loại chứng chỉ
export function useCertificateTypeDetail(id?: number | null) {
  return useQuery({
    queryKey: CERTIFICATE_TYPE_QUERY_KEY.detail(id ?? 0),
    queryFn: () => certificateTypeApi.getDetailType(id!),
    enabled: id != null && id > 0,
  });
}

// Tạo loại chứng chỉ
export function useCreateCertificateType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCertificateTypeRequest) =>
      certificateTypeApi.createType(data),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }
      queryClient.invalidateQueries({
        queryKey: CERTIFICATE_TYPE_QUERY_KEY.all,
      });
      showSuccess("Tạo loại chứng chỉ thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi tạo loại chứng chỉ"));
    },
  });
}

// Sửa loại chứng chỉ
export function useUpdateCertificateType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateCertificateTypeRequest;
    }) => certificateTypeApi.updateType(id, data),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }
      queryClient.invalidateQueries({
        queryKey: CERTIFICATE_TYPE_QUERY_KEY.all,
      });
      showSuccess("Cập nhật loại chứng chỉ thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(
        getErrorMessage(error, "Có lỗi xảy ra khi cập nhật loại chứng chỉ"),
      );
    },
  });
}

// Xóa loại chứng chỉ
export function useDeleteCertificateType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => certificateTypeApi.deleteType(id),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }
      queryClient.invalidateQueries({
        queryKey: CERTIFICATE_TYPE_QUERY_KEY.all,
      });
      showSuccess("Xóa loại chứng chỉ thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi xóa loại chứng chỉ"));
    },
  });
}
