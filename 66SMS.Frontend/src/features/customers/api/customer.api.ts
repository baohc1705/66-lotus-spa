import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
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

const BASE = API.customers;

export const customerApi = {
  getAll: (params: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<CustomerDto>>>(BASE, { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance.get<Result<CustomerDto>>(`${BASE}/${id}`).then((r) => r.data),

  create: (payload: CreateCustomerPayload) =>
    axiosInstance.post<Result<object>>(BASE, payload).then((r) => r.data),

  update: (id: number, payload: UpdateCustomerPayload) =>
    axiosInstance
      .patch<Result<object>>(`${BASE}/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`${BASE}/${id}`).then((r) => r.data),
};
