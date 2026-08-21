import type {
  CreateSalonRequest,
  GetAllSalonQuery,
  SalonDto,
  SalonFullDto,
  UpdateSalonRequest,
} from "@/features/salons/types/salon.types";
import axiosInstance from "@/shared/api/axiosInstance";
import type { PagedResult, Result } from "@/shared/types/common.types";

export const salonApi = {
  // Query API
  getAll: async (
    params: GetAllSalonQuery,
  ): Promise<Result<PagedResult<SalonDto>>> => {
    const response = await axiosInstance.get("/salons", { params });
    return response.data;
  },

  adminGetAll: async (
    params: GetAllSalonQuery,
  ): Promise<Result<PagedResult<SalonDto>>> => {
    const response = await axiosInstance.get("/salons/admin", { params });
    return response.data;
  },

  getDetail: async (id: number): Promise<Result<SalonFullDto>> => {
    const response = await axiosInstance.get(`/salons/${id}`);
    return response.data;
  },

  getPrimary: async (): Promise<Result<SalonFullDto | null>> => {
    const response = await axiosInstance.get("/salons/primary");
    return response.data;
  },

  getActiveItems: async (): Promise<SalonDto[]> => {
    const response = await axiosInstance.get<Result<PagedResult<SalonDto>>>(
      "/salons",
      { params: { pageSize: 100, orderBy: "sortorder" } },
    );
    return response.data.data?.items ?? [];
  },

  // Command API
  create: async (request: CreateSalonRequest): Promise<Result<number>> => {
    const response = await axiosInstance.post<Result<number>>(
      "/salons",
      request,
    );
    return response.data;
  },

  update: async (
    id: number,
    request: UpdateSalonRequest,
  ): Promise<Result<object>> => {
    const response = await axiosInstance.patch<Result<object>>(
      `/salons/${id}`,
      request,
    );
    return response.data;
  },

  delete: async (id: number): Promise<Result<object>> => {
    const response = await axiosInstance.delete<Result<object>>(
      `/salons/${id}`,
    );
    return response.data;
  },
};
