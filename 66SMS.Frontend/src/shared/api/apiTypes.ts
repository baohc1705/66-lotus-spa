// Định nghĩa kiểu dữ liệu trả về từ API backend.
//
// Result<T>      — mọi response đều wrap trong Result
// PagedResult<T> — dùng cho API trả danh sách có phân trang
// PageRequest    — tham số gửi lên cho API danh sách (page, filter, sort)
export type { Result, PagedResult, PageRequest } from '@/shared/types/common.types';