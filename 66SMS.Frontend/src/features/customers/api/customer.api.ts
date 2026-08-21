import axiosInstance from "@/shared/api/axiosInstance";
import type {
  Result,
  PagedResult,
  PageRequest,
} from "@/shared/types/common.types";
import type {
  CustomerDto,
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from "../types/customer.types";

export const customerApi = {
  // Query API
  getAll: async (
    params: PageRequest,
  ): Promise<Result<PagedResult<CustomerDto>>> => {
    const response = await axiosInstance.get<Result<PagedResult<CustomerDto>>>(
      "/customer",
      { params },
    );
    return response.data;
  },

  getDetail: async (id: number): Promise<Result<CustomerDto>> => {
    const response = await axiosInstance.get<Result<CustomerDto>>(
      `/customer/${id}`,
    );
    return response.data;
  },

  // Command API
  create: async (payload: CreateCustomerRequest): Promise<Result<object>> => {
    const response = await axiosInstance.post<Result<object>>(
      "/customer",
      payload,
    );
    return response.data;
  },

  update: async (
    id: number,
    payload: UpdateCustomerRequest,
  ): Promise<Result<object>> => {
    const response = await axiosInstance.patch<Result<object>>(
      `/customer/${id}`,
      payload,
    );
    return response.data;
  },

  delete: async (id: number): Promise<Result<object>> => {
    const response = await axiosInstance.delete<Result<object>>(
      `/customer/${id}`,
    );
    return response.data;
  },
};
