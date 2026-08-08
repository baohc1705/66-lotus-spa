import axiosInstance from "@/shared/api/axiosInstance";
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
  getAllTypes: (params: CertificateTypeQueryParams) =>
    axiosInstance
      .get<Result<PagedResult<CertificateTypeDTO>>>("/certificate-type", { params })
      .then((r) => r.data),

  getDetailType: (id: number) =>
    axiosInstance
      .get<Result<CertificateTypeDTO>>(`/certificate-type/${id}`)
      .then((r) => r.data),

  createType: (payload: CreateCertificateTypePayload) =>
    axiosInstance
      .post<Result<number>>("/certificate-type", payload)
      .then((r) => r.data),

  updateType: (id: number, payload: UpdateCertificateTypePayload) =>
    axiosInstance
      .patch<Result<object>>(`/certificate-type/${id}`, payload)
      .then((r) => r.data),

  deleteType: (id: number) =>
    axiosInstance
      .delete<Result<object>>(`/certificate-type/${id}`)
      .then((r) => r.data),

  getAll: (params: StaffCertificateQueryParams) =>
    axiosInstance
      .get<Result<PagedResult<StaffCertificateDTO>>>("/staff-certificate", { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<StaffCertificateDTO>>(`/staff-certificate/${id}`)
      .then((r) => r.data),

  create: (payload: CreateStaffCertificatePayload) =>
    axiosInstance
      .post<Result<number>>("/staff-certificate", payload)
      .then((r) => r.data),

  update: (id: number, payload: UpdateStaffCertificatePayload) =>
    axiosInstance
      .patch<Result<object>>(`/staff-certificate/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance
      .delete<Result<object>>(`/staff-certificate/${id}`)
      .then((r) => r.data),
};
