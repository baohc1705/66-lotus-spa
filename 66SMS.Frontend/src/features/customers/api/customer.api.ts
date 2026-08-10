import axiosInstance from "@/shared/api/axiosInstance";
import type {
  Result,
  PagedResult,
  PageRequest,
} from "@/shared/types/common.types";
import type {
  CustomerDto,
  CreateCustomerPayload,
  UpdateCustomerPayload,
} from "../types/customer.types";

export const customerApi = {
  getAll: (params: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<CustomerDto>>>("/customer", { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance.get<Result<CustomerDto>>(`/customer/${id}`).then((r) => r.data),

  create: (payload: CreateCustomerPayload) =>
    axiosInstance.post<Result<object>>("/customer", payload).then((r) => r.data),

  update: (id: number, payload: UpdateCustomerPayload) =>
    axiosInstance
      .patch<Result<object>>(`/customer/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`/customer/${id}`).then((r) => r.data),
};
