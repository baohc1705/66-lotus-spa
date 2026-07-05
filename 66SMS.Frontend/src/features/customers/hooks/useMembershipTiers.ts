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

const TIER_KEYS = {
  all: ["membershipTiers"] as const,
  lists: () => [...TIER_KEYS.all, "list"] as const,
  list: (params: MembershipTierQueryParams) =>
    [...TIER_KEYS.lists(), params] as const,
  details: () => [...TIER_KEYS.all, "detail"] as const,
  detail: (id: number) => [...TIER_KEYS.details(), id] as const,
};

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
      const msg = error.response?.data?.message ?? TOAST_MSG.actionError("tạo", ENTITY);
      toast.error(msg);
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
      const msg = error.response?.data?.message ?? TOAST_MSG.actionError("cập nhật", ENTITY);
      toast.error(msg);
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
      const msg = error.response?.data?.message ?? TOAST_MSG.actionError("xóa", ENTITY);
      toast.error(msg);
    },
  });
}
