import { createEntityQueryKeys } from '@/shared/utils/queryKeys';
import { getErrorMessage } from '@/shared/utils/errorUtils';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { membershipCardApi } from "../api/membershipCard.api";
import { TOAST_MSG } from "@/shared/constants/toast.messages";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import type { Result } from "@/shared/types/common.types";
import type {
  UpdateMembershipCardPayload,
  MembershipCardQueryParams,
} from "../types/membershipCard.types";

const ENTITY = "thẻ thành viên";

export const CARD_KEYS = createEntityQueryKeys<MembershipCardQueryParams>("cards");

export function useMembershipCards(params: MembershipCardQueryParams) {
  return useQuery({
    queryKey: CARD_KEYS.list(params),
    queryFn: () => membershipCardApi.getAll(params),
  });
}

export function useMembershipCardDetail(id: number | null) {
  return useQuery({
    queryKey: CARD_KEYS.detail(id!),
    queryFn: () => membershipCardApi.getDetail(id!),
    enabled: id !== null && id > 0,
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
      payload: UpdateMembershipCardPayload;
    }) => membershipCardApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: CARD_KEYS.all });
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
