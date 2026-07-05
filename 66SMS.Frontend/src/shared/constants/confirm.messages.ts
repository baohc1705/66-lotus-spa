export const CONFIRM_MSG = {
  deleteTitle: (entity: string) => `Xóa ${entity}`,
  deleteDescription: (entity: string, name: string, extraWarning?: string) =>
    `Bạn có chắc muốn xóa ${entity} "${name}"?` +
    (extraWarning ? ` ${extraWarning}` : "") +
    ` Hành động này không thể hoàn tác.`,
  bulkDeleteTitle: (entity: string) => `Xóa ${entity} đã chọn`,
  bulkDeleteDescription: (
    count: number,
    entity: string,
    extraWarning?: string,
  ) =>
    `Bạn có chắc muốn xóa ${count} ${entity} đã chọn?` +
    (extraWarning ? ` ${extraWarning}` : ""),
  restoreTitle: (entitySubject: string) => `Khôi phục ${entitySubject}`,
  restoreDescription: (entitySubject: string, name: string) =>
    `Bạn có chắc muốn khôi phục ${entitySubject} "${name}"? ` +
    `${entitySubject} sẽ hiển thị lại trong danh sách chính.`,
} as const;
