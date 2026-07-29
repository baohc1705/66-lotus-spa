import { createEntityQueryKeys } from "@/shared/utils/queryKeys";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { customerApi } from "../api/customer.api";
import type { PageRequest, Result } from "@/shared/types/common.types";
import { TOAST_MSG } from "@/shared/constants/toast.messages";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { StatusActive } from "@/shared/constants/status.enum";
import type {
  CreateCustomerPayload,
  UpdateCustomerPayload,
} from "../types/customer.types";

const ENTITY = "khách hàng";

export const CUSTOMER_KEYS = createEntityQueryKeys<PageRequest>("customers");

export function useCustomers(params: PageRequest) {
  return useQuery({
    queryKey: CUSTOMER_KEYS.list(params),
    queryFn: () => customerApi.getAll(params),
  });
}

export function useCustomerDetail(id: number | null) {
  return useQuery({
    queryKey: CUSTOMER_KEYS.detail(id!),
    queryFn: () => customerApi.getDetail(id!),
    enabled: id !== null && id > 0,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCustomerPayload) => customerApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: CUSTOMER_KEYS.lists() });
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

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateCustomerPayload;
    }) => customerApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: CUSTOMER_KEYS.all });
        toast.success(TOAST_MSG.updateSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(
        getErrorMessage(error, TOAST_MSG.actionError("cập nhật", ENTITY)),
      );
    },
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => customerApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: CUSTOMER_KEYS.lists() });
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

export function useRestoreCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      customerApi.update(id, { status: StatusActive.Active }),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: CUSTOMER_KEYS.all });
        toast.success(TOAST_MSG.restoreSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(
        getErrorMessage(error, TOAST_MSG.actionError("khôi phục", ENTITY)),
      );
    },
  });
}
