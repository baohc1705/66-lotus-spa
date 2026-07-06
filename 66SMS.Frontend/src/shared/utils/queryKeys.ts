export function createEntityQueryKeys<TParams = unknown>(name: string) {
  return {
    all: [name] as const,
    lists: () => [name, "list"] as const,
    list: (params: TParams) => [name, "list", params] as const,
    adminLists: () => [name, "admin"] as const,
    adminList: (params: TParams) => [name, "admin", params] as const,
    deletedLists: () => [name, "deleted"] as const,
    deletedList: (params: TParams) => [name, "deleted", params] as const,
    details: () => [name, "detail"] as const,
    detail: (id: number) => [name, "detail", id] as const,
  };
}
