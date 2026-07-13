import { useTableQueryParams } from "@/shared/hooks/useTableQueryParams";

export function useAccountListState() {
  return useTableQueryParams();
}

export type AccountListState = ReturnType<typeof useAccountListState>;
