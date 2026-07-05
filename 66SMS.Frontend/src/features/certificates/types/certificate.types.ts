import type { PageRequest } from "@/shared/types/common.types";

export interface CertificateTypeDTO {
  id?: number;
  code?: string;
  name?: string;
  description?: string;
  sortOrder?: number;
  status?: number;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
}

export interface StaffCertificateDTO {
  id?: number;
  staffId?: number;
  staffName?: string;
  certificateTypeId?: number;
  typeName?: string;
  certificateName?: string;
  certificateNumber?: string;
  issuingOrganization?: string;
  issuedDate?: string;
  expiryDate?: string;
  documentUrl?: string;
  note?: string;
  status?: number;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
}

export interface CertificateTypeQueryParams extends PageRequest {
  status?: number;
  filter?: string;
}

export interface StaffCertificateQueryParams extends PageRequest {
  staffId?: number;
  status?: number;
  expiringInDays?: number;
  filter?: string;
}

export type {
  CreateCertificateTypePayload,
  UpdateCertificateTypePayload,
  CertificateTypeFormValues,
} from "../schemas/certificateType.schema";

export type {
  CreateStaffCertificatePayload,
  UpdateStaffCertificatePayload,
  StaffCertificateFormValues,
} from "../schemas/staffCertificate.schema";
