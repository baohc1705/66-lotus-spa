import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
import type { Result, PagedResult } from "@/shared/types/common.types";
import type {
  CertificateTypeDTO,
  StaffCertificateDTO,
  CreateCertificateTypePayload,
  UpdateCertificateTypePayload,
  CreateStaffCertificatePayload,
  UpdateStaffCertificatePayload,
  CertificateTypeQueryParams,
  StaffCertificateQueryParams,
} from "../types/certificate.types";

export const certificateApi = {
  // CertificateType
  getAllTypes: (params: CertificateTypeQueryParams) =>
    axiosInstance
      .get<Result<PagedResult<CertificateTypeDTO>>>(API.certificateTypes, { params })
      .then((r) => r.data),

  getDetailType: (id: number) =>
    axiosInstance
      .get<Result<CertificateTypeDTO>>(`${API.certificateTypes}/${id}`)
      .then((r) => r.data),

  createType: (payload: CreateCertificateTypePayload) =>
    axiosInstance
      .post<Result<number>>(API.certificateTypes, payload)
      .then((r) => r.data),

  updateType: (id: number, payload: UpdateCertificateTypePayload) =>
    axiosInstance
      .patch<Result<object>>(`${API.certificateTypes}/${id}`, payload)
      .then((r) => r.data),

  deleteType: (id: number) =>
    axiosInstance
      .delete<Result<object>>(`${API.certificateTypes}/${id}`)
      .then((r) => r.data),

  // StaffCertificate
  getAll: (params: StaffCertificateQueryParams) =>
    axiosInstance
      .get<Result<PagedResult<StaffCertificateDTO>>>(API.staffCertificates, { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<StaffCertificateDTO>>(`${API.staffCertificates}/${id}`)
      .then((r) => r.data),

  create: (payload: CreateStaffCertificatePayload) =>
    axiosInstance
      .post<Result<number>>(API.staffCertificates, payload)
      .then((r) => r.data),

  update: (id: number, payload: UpdateStaffCertificatePayload) =>
    axiosInstance
      .patch<Result<object>>(`${API.staffCertificates}/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance
      .delete<Result<object>>(`${API.staffCertificates}/${id}`)
      .then((r) => r.data),
};
