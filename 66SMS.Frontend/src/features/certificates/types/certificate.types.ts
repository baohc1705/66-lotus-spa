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

export interface CreateCertificateTypePayload {
  code: string;
  name: string;
  description?: string;
  sortOrder?: number;
  status?: number;
}

export type UpdateCertificateTypePayload = Partial<CreateCertificateTypePayload>;

export interface CreateStaffCertificatePayload {
  staffId: number;
  certificateTypeId: number;
  certificateName: string;
  certificateNumber?: string;
  issuingOrganization: string;
  issuedDate: string;
  expiryDate?: string;
  documentUrl?: string;
  note?: string;
  status?: number;
}

export type UpdateStaffCertificatePayload = Partial<Omit<CreateStaffCertificatePayload, 'staffId'>>;

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
