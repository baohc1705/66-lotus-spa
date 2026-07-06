import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { promotionApi } from "../api/promotion.api";
import type { PageRequest } from "@/shared/types/common.types";
import { TOAST_MSG } from "@/shared/constants/toast.messages";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import type {
  CreatePromotionPayload,
  UpdatePromotionPayload,
} from "../types/promotion.types";

const ENTITY = "khuyến mãi";

const PROMOTION_KEYS = {
  all: ["promotions"] as const,
  lists: () => [...PROMOTION_KEYS.all, "list"] as const,
  list: (params: PageRequest) => [...PROMOTION_KEYS.lists(), params] as const,
  details: () => [...PROMOTION_KEYS.all, "detail"] as const,
  detail: (id: number) => [...PROMOTION_KEYS.details(), id] as const,
};

export function usePromotions(params: PageRequest) {
  return useQuery({
    queryKey: PROMOTION_KEYS.list(params),
    queryFn: () => promotionApi.getAll(params),
  });
}

export function useAdminPromotions(params: PageRequest, enabled = true) {
  return useQuery({
    queryKey: PROMOTION_KEYS.list(params),
    queryFn: () => promotionApi.getAll(params),
    enabled,
  });
}

export function useCreatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePromotionPayload) =>
      promotionApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: PROMOTION_KEYS.lists() });
        toast.success(TOAST_MSG.createSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: () => {
      toast.error(TOAST_MSG.actionError("tạo", ENTITY));
    },
  });
}

export function useUpdatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdatePromotionPayload;
    }) => promotionApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: PROMOTION_KEYS.all });
        toast.success(TOAST_MSG.updateSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: () => {
      toast.error(TOAST_MSG.actionError("cập nhật", ENTITY));
    },
  });
}

export function useDeletePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => promotionApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: PROMOTION_KEYS.lists() });
        toast.success(TOAST_MSG.deleteSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: () => {
      toast.error(TOAST_MSG.actionError("xóa", ENTITY));
    },
  });
}
