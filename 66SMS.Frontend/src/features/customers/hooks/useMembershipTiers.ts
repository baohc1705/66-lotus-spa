import { createEntityQueryKeys } from "@/shared/utils/queryKeys";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { showError, showSuccess } from "@/shared/utils/kitToast";
import type { AxiosError } from "axios";
import { membershipTierApi } from "../api/membershipTier.api";
import type { Result } from "@/shared/types/common.types";
import type {
  CreateMembershipTierRequest,
  GetAllMembershipTierQuery,
  UpdateMembershipTierRequest,
} from "../types/membershipTier.types";

// Tạo query keys cho dịch vụ để dùng trong query cache
export const MEMBERSHIP_TIER_QUERY_KEY =
  createEntityQueryKeys<GetAllMembershipTierQuery>("membership-tiers");

// Lấy danh sách hạng thành viên
export function useMembershipTiers(params: GetAllMembershipTierQuery) {
  return useQuery({
    queryKey: MEMBERSHIP_TIER_QUERY_KEY.list(params),
    queryFn: () => membershipTierApi.getAll(params),
  });
}

// Lấy chi tiết hạng thành viên
export function useMembershipTierDetail(id: number) {
  return useQuery({
    queryKey: MEMBERSHIP_TIER_QUERY_KEY.detail(id),
    queryFn: () => membershipTierApi.getDetail(id),
  }); 
}

// Tạo hạng thành viên
export function useCreateMembershipTier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMembershipTierRequest) =>
      membershipTierApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || `Có lỗi xảy ra khi tạo hạng thành viên`);
        return;
      }

      qc.invalidateQueries({ queryKey: MEMBERSHIP_TIER_QUERY_KEY.all });
      showSuccess(`Tạo hạng thành viên thành công`);
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, `Có lỗi xảy ra khi tạo hạng thành viên`));
    },
  });
}

// Cập nhật hạng thành viên
export function useUpdateMembershipTier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateMembershipTierRequest;
    }) => membershipTierApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || `Có lỗi xảy ra khi cập nhật hạng thành viên`);
        return;
      }

      qc.invalidateQueries({ queryKey: MEMBERSHIP_TIER_QUERY_KEY.all });
      showSuccess(`Cập nhật hạng thành viên thành công`);
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, `Có lỗi xảy ra khi cập nhật hạng thành viên`));
    },
  });
}

// Xóa hạng thành viên
export function useDeleteMembershipTier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => membershipTierApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || `Có lỗi xảy ra khi xóa hạng thành viên`);
        return;
      }

      qc.invalidateQueries({ queryKey: MEMBERSHIP_TIER_QUERY_KEY.all });
      showSuccess(`Xóa hạng thành viên thành công`);
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, `Có lỗi xảy ra khi xóa hạng thành viên`));
    },
  });
}
