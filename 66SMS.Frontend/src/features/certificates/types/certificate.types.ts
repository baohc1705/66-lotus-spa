import type { PageRequest } from "@/shared/types/common.types";

export interface StaffCertificateDto {
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

export interface GetAllStaffCertificateQuery extends PageRequest {
  staffId?: number;
  status?: number;
  expiringInDays?: number;
  certificateTypeId?: number;
  filter?: string;
}

export interface CreateStaffCertificateRequest {
  staffId: number;
  certificateTypeId: number;
  certificateName: string;
  certificateNumber?: string;
  issuingOrganization: string;
  issuedDate: string;
  expiryDate?: string;
  documentUrl?: string;
  imageBase64?: string;
  note?: string;
  status?: number;
}

export interface UpdateStaffCertificateRequest {
  certificateTypeId?: number;
  certificateName?: string;
  certificateNumber?: string;
  issuingOrganization?: string;
  issuedDate?: string;
  expiryDate?: string;
  documentUrl?: string;
  imageBase64?: string;
  note?: string;
  status?: number;
}
