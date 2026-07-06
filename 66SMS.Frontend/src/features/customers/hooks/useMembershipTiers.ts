import { createEntityQueryKeys } from '@/shared/utils/queryKeys';
import { getErrorMessage } from '@/shared/utils/errorUtils';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { membershipTierApi } from "../api/membershipTier.api";
import { TOAST_MSG } from "@/shared/constants/toast.messages";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import type { Result } from "@/shared/types/common.types";
import type {
  CreateMembershipTierPayload,
  UpdateMembershipTierPayload,
  MembershipTierQueryParams,
} from "../types/membershipTier.types";

const ENTITY = "hạng thành viên";

export const TIER_KEYS = createEntityQueryKeys<MembershipTierQueryParams>("tiers");

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
        qc.invalidateQueries({ queryKey: TIER_KEYS.lists() });
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
        toast.success(TOAST_MSG.updateSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(error, TOAST_MSG.actionError("cập nhật", ENTITY)));
    },
  });
}

export function useDeleteMembershipTier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => membershipTierApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: TIER_KEYS.lists() });
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
