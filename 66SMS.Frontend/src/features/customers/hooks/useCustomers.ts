import { createEntityQueryKeys } from "@/shared/utils/queryKeys";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { showError, showSuccess } from "@/shared/utils/kitToast";
import type { AxiosError } from "axios";
import { customerApi } from "@/features/customers/api/customer.api";
import type { Result } from "@/shared/types/common.types";
import { StatusActive } from "@/shared/constants/status.enum";
import type {
  CreateCustomerRequest,
  GetAllCustomerQuery,
  UpdateCustomerRequest,
} from "@/features/customers/types/customer.types";
import { bookingApi } from "@/features/booking/api/booking.api";
import type { GetAllAppointmentParams } from "@/features/booking/types/booking.types";

// Tạo query keys cho khách hàng để dùng trong query cache
export const CUSTOMER_QUERY_KEY =
  createEntityQueryKeys<GetAllCustomerQuery>("customers");

// Lấy danh sách khách hàng
export function useCustomers(params: GetAllCustomerQuery, enabled = true) {
  return useQuery({
    queryKey: CUSTOMER_QUERY_KEY.list(params),
    queryFn: () => customerApi.getAll(params),
    enabled,
  });
}

// Lấy chi tiết khách hàng
export function useCustomerDetail(id: number) {
  return useQuery({
    queryKey: CUSTOMER_QUERY_KEY.detail(id),
    queryFn: () => customerApi.getDetail(id),
  });
}

// Tạo khách hàng
export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCustomerRequest) => customerApi.create(payload),
    onSuccess: (result) => {
      if (!result.isSuccess) {
        showError(result.message || `Có lỗi xảy ra khi tạo khách hàng`);
        return;
      }

      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEY.all });
      showSuccess(`Tạo khách hàng thành công`);
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, `Có lỗi xảy ra khi tạo khách hàng`));
    },
  });
}

// Cập nhật khách hàng
export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateCustomerRequest;
    }) => customerApi.update(id, payload),
    onSuccess: (result) => {
      if (!result.isSuccess) {
        showError(result.message || `Có lỗi xảy ra khi cập nhật khách hàng`);
        return;
      }

      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEY.all });
      showSuccess(`Cập nhật khách hàng thành công`);
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(
        getErrorMessage(error, `Có lỗi xảy ra khi cập nhật khách hàng`),
      );
    },
  });
}

// Xóa khách hàng
export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => customerApi.delete(id),
    onSuccess: (result) => {
      if (!result.isSuccess) {
        showError(result.message || `Có lỗi xảy ra khi xóa khách hàng`);
        return;
      }

      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEY.all });
      showSuccess(`Xóa khách hàng thành công`);
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, `Có lỗi xảy ra khi xóa khách hàng`));
    },
  });
}

// Khôi phục khách hàng
export function useRestoreCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      customerApi.update(id, { status: StatusActive.Active }),
    onSuccess: (result) => {
      if (!result.isSuccess) {
        showError(result.message || `Có lỗi xảy ra khi khôi phục khách hàng`);
        return;
      }

      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEY.all });
      showSuccess(`Khôi phục khách hàng thành công`);
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(
        getErrorMessage(error, `Có lỗi xảy ra khi khôi phục khách hàng`),
      );
    },
  });
}

// lấy danh sách lịch hẹn của khách hàng
export function useCustomerAppointments(params: GetAllAppointmentParams) {
  return useQuery({
    queryKey: ["customer-appointments", params],
    queryFn: () => bookingApi.getByUserId(params),
  });
}
