import type { PageRequest } from "@/shared/types/common.types";

export interface CertificateTypeDto {
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
export interface CreateCertificateTypeRequest {
  code: string;
  name: string;
  description?: string;
  sortOrder?: number;
  status?: number;
}

export interface UpdateCertificateTypeRequest {
  code?: string;
  name?: string;
  description?: string;
  sortOrder?: number;
  status?: number;
}

export interface GetAllCertificateTypeQuery extends PageRequest {
  status?: number;
  filter?: string;
}
