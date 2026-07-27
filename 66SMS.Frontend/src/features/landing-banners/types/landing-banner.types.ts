export interface LandingBannerDto {
  id?: number;
  title?: string;
  subtitle?: string;
  brandLabel?: string;
  imageUrl?: string;
  ctaPrimaryText?: string;
  ctaPrimaryHref?: string;
  ctaSecondaryText?: string;
  ctaSecondaryHref?: string;
  sortOrder?: number;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLandingBannerPayload {
  title: string;
  subtitle?: string;
  brandLabel?: string;
  imageUrl?: string;
  imageBase64?: string;
  ctaPrimaryText?: string;
  ctaPrimaryHref?: string;
  ctaSecondaryText?: string;
  ctaSecondaryHref?: string;
  sortOrder?: number;
  status?: number;
}

export type UpdateLandingBannerPayload = Partial<CreateLandingBannerPayload>;

export interface LandingBannerQueryParams {
  filter?: string;
  pageIndex?: number;
  pageSize?: number;
  orderBy?: string;
  isDescending?: boolean;
  status?: number;
}
