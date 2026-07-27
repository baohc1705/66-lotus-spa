import { createEntityQueryKeys } from "@/shared/utils/queryKeys";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { landingBannerApi } from "../api/landing-banner.api";
import { TOAST_MSG } from "@/shared/constants/toast.messages";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import type {
  LandingBannerQueryParams,
  CreateLandingBannerPayload,
  UpdateLandingBannerPayload,
} from "../types/landing-banner.types";
import type { Result } from "@/shared/types/common.types";

const ENTITY = "banner landing";

export const LANDING_BANNER_KEYS =
  createEntityQueryKeys<LandingBannerQueryParams>("landing-banners");

export function usePublicLandingBanners() {
  return useQuery({
    queryKey: [...LANDING_BANNER_KEYS.all, "public"] as const,
    queryFn: () => landingBannerApi.getPublic(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminLandingBanners(
  params: LandingBannerQueryParams,
  enabled = true
) {
  return useQuery({
    queryKey: LANDING_BANNER_KEYS.adminList(params),
    queryFn: () => landingBannerApi.getAdminAll(params),
    enabled,
  });
}

export function useLandingBannerDetail(id: number | null) {
  return useQuery({
    queryKey: LANDING_BANNER_KEYS.detail(id!),
    queryFn: () => landingBannerApi.getDetail(id!),
    enabled: id !== null && id > 0,
  });
}

export function useCreateLandingBannerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLandingBannerPayload) =>
      landingBannerApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: LANDING_BANNER_KEYS.all });
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

export function useUpdateLandingBannerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateLandingBannerPayload;
    }) => landingBannerApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: LANDING_BANNER_KEYS.all });
        toast.success(TOAST_MSG.updateSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(
        getErrorMessage(error, TOAST_MSG.actionError("cập nhật", ENTITY))
      );
    },
  });
}

export function useDeleteLandingBannerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => landingBannerApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: LANDING_BANNER_KEYS.all });
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
