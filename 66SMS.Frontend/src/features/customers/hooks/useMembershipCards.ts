import { createEntityQueryKeys } from "@/shared/utils/queryKeys";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { showError, showSuccess } from "@/shared/utils/kitToast";
import type { AxiosError } from "axios";
import { membershipCardApi } from "../api/membershipCard.api";
import type { Result } from "@/shared/types/common.types";
import type {
  CreateMembershipCardRequest,
  GetAllMembershipCardQuery,
  UpdateMembershipCardRequest,
} from "../types/membershipCard.types";

const ENTITY = "thẻ thành viên";

export const MEMBERSHIP_CARD_QUERY_KEY =
  createEntityQueryKeys<GetAllMembershipCardQuery>("cards");

export function useMembershipCards(params: GetAllMembershipCardQuery) {
  return useQuery({
    queryKey: MEMBERSHIP_CARD_QUERY_KEY.list(params),
    queryFn: () => membershipCardApi.getAll(params),
  });
}

export function useMembershipCardDetail(id: number | null) {
  return useQuery({
    queryKey: MEMBERSHIP_CARD_QUERY_KEY.detail(id!),
    queryFn: () => membershipCardApi.getDetail(id!),
    enabled: id !== null && id > 0,
  });
}

export function useCreateMembershipCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMembershipCardRequest) =>
      membershipCardApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || `Có lỗi xảy ra khi tạo ${ENTITY}`);
        return;
      }

      qc.invalidateQueries({ queryKey: MEMBERSHIP_CARD_QUERY_KEY.all });
      showSuccess(`Tạo ${ENTITY} thành công`);
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, `Có lỗi xảy ra khi tạo ${ENTITY}`));
    },
  });
}

export function useUpdateMembershipCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateMembershipCardRequest;
    }) => membershipCardApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || `Có lỗi xảy ra khi cập nhật ${ENTITY}`);
        return;
      }

      qc.invalidateQueries({ queryKey: MEMBERSHIP_CARD_QUERY_KEY.all });
      showSuccess(`Cập nhật ${ENTITY} thành công`);
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, `Có lỗi xảy ra khi cập nhật ${ENTITY}`));
    },
  });
}
