import { createEntityQueryKeys } from "@/shared/utils/queryKeys";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/utils/kitToast";
import type { AxiosError } from "axios";
import { membershipTierApi } from "../api/membershipTier.api";
import type { Result } from "@/shared/types/common.types";
import type {
  CreateMembershipTierPayload,
  UpdateMembershipTierPayload,
  MembershipTierQueryParams,
} from "../types/membershipTier.types";

const ENTITY = "hạng thành viên";

export const TIER_KEYS =
  createEntityQueryKeys<MembershipTierQueryParams>("tiers");

export function useMembershipTiers(params: MembershipTierQueryParams) {
  return useQuery({
    queryKey: TIER_KEYS.list(params),
    queryFn: () => membershipTierApi.getAll(params),
  });
}

export function useMembershipTierDetail(id: number | null) {
  return useQuery({
    queryKey: TIER_KEYS.detail(id!),
    queryFn: () => membershipTierApi.getDetail(id!),
    enabled: id !== null && id > 0,
  });
}

export function useCreateMembershipTier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMembershipTierPayload) =>
      membershipTierApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: TIER_KEYS.all });
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

export function useUpdateMembershipTier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateMembershipTierPayload;
    }) => membershipTierApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: TIER_KEYS.all });
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

export function useDeleteMembershipTier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => membershipTierApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: TIER_KEYS.all });
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
