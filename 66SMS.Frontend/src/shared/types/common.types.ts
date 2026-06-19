// Re-export các kiểu từ apiTypes.ts để import gọn hơn từ các nơi khác.
// Dùng: import type { Result } from '@/shared/types/common.types'

export interface Result<T> {
  code: number;
  message: string;
  data?: T;
  errorCode?: string;
  isSuccess: boolean;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
export interface PageRequest {
  pageIndex?: number;
  pageSize?: number;
  filter?: string;
  orderBy?: string;
  isDescending?: boolean;
}
