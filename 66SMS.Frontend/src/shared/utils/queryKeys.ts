// Key cache TanStack Query. Invalidate all thì refetch cả entity.
export function createEntityQueryKeys<TParams = unknown>(name: string) {
  return {
    // Sau tạo, sửa, xóa: refetch list, admin, detail.
    all: [name] as const,
    // GET public. params khác (trang, filter) = cache khác.
    list: (params: TParams) => [name, "list", params] as const,
    // GET /admin. Thùng rác: adminList({ ...params, isDeleted: true }).
    adminList: (params: TParams) => [name, "admin", params] as const,
    // GET một dòng theo id.
    detail: (id: number) => [name, "detail", id] as const,
  };
}
