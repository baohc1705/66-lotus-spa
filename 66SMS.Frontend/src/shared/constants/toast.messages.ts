export const TOAST_MSG = {
  createSuccess: (entity: string) => `Tạo ${entity} thành công`,
  updateSuccess: (entity: string) => `Cập nhật ${entity} thành công`,
  deleteSuccess: (entity: string) => `Xóa ${entity} thành công`,
  bulkDeleteSuccess: (entity: string) => `Xóa ${entity} đã chọn thành công`,
  restoreSuccess: (entity: string) => `Khôi phục ${entity} thành công`,
  actionError: (action: string, entity: string) =>
    `Có lỗi xảy ra khi ${action} ${entity}`,
  subActionSuccess: (action: string, target: string) =>
    `${action} ${target} thành công`,
  subActionError: (action: string, target: string) =>
    `Đã xảy ra lỗi khi ${action.toLowerCase()} ${target}`,
} as const;
