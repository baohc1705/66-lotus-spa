import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
import type {
  Result,
  PagedResult,
  PageRequest,
} from "@/shared/types/common.types";
import type {
  TreatmentCourseDto,
  CreateTreatmentCoursePayload,
  UpdateTreatmentCoursePayload,
  DeleteTreatmentCourseMultiplesPayload,
} from "../types/treatmentCourse.types";

const BASE = API.treatmentCourses;

export const treatmentCourseApi = {
  getAll: (params: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<TreatmentCourseDto>>>(BASE, { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<TreatmentCourseDto>>(`${BASE}/${id}`)
      .then((r) => r.data),

  create: (payload: CreateTreatmentCoursePayload) =>
    axiosInstance.post<Result<object>>(BASE, payload).then((r) => r.data),

  update: (id: number, payload: UpdateTreatmentCoursePayload) =>
    axiosInstance
      .patch<Result<object>>(`${BASE}/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`${BASE}/${id}`).then((r) => r.data),

  adminGetAll: (params: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<TreatmentCourseDto>>>(`${BASE}/admin`, { params })
      .then((r) => r.data),

  deleteMultiples: (payload: DeleteTreatmentCourseMultiplesPayload) =>
    axiosInstance
      .delete<Result<object>>(`${BASE}/bulk`, { data: payload })
      .then((r) => r.data),

  getAllDeleted: (params: PageRequest) =>
    axiosInstance
      .get<
        Result<PagedResult<TreatmentCourseDto>>
      >(`${BASE}/deleted`, { params })
      .then((r) => r.data),
};
