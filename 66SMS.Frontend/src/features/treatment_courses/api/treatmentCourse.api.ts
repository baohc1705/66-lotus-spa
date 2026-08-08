import axiosInstance from "@/shared/api/axiosInstance";
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

export const treatmentCourseApi = {
  getAll: (params: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<TreatmentCourseDto>>>("/treatment-course", { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<TreatmentCourseDto>>(`/treatment-course/${id}`)
      .then((r) => r.data),

  create: (payload: CreateTreatmentCoursePayload) =>
    axiosInstance.post<Result<object>>("/treatment-course", payload).then((r) => r.data),

  update: (id: number, payload: UpdateTreatmentCoursePayload) =>
    axiosInstance
      .patch<Result<object>>(`/treatment-course/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`/treatment-course/${id}`).then((r) => r.data),

  adminGetAll: (params: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<TreatmentCourseDto>>>(`/treatment-course/admin`, { params })
      .then((r) => r.data),

  deleteMultiples: (payload: DeleteTreatmentCourseMultiplesPayload) =>
    axiosInstance
      .delete<Result<object>>(`/treatment-course/bulk`, { data: payload })
      .then((r) => r.data),

  getAllDeleted: (params: PageRequest) =>
    axiosInstance
      .get<
        Result<PagedResult<TreatmentCourseDto>>
      >(`/treatment-course/deleted`, { params })
      .then((r) => r.data),
};
