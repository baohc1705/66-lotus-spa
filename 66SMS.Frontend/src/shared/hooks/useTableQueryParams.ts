import { useState, useCallback, useMemo } from "react";
import type { VisibilityState } from "@tanstack/react-table";
import { DEFAULT_PAGE_SIZE } from "@/shared/constants/display.const";

export function useTableQueryParams(initialPageSize = DEFAULT_PAGE_SIZE) {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [filter, setFilter] = useState("");
  const [orderBy, setOrderBy] = useState<string | undefined>(undefined);
  const [isDescending, setIsDescending] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const queryParams = useMemo(
    () => ({
      pageIndex,
      pageSize,
      filter: filter || undefined,
      orderBy,
      isDescending,
    }),
    [pageIndex, pageSize, filter, orderBy, isDescending],
  );

  const handleSort = useCallback(
    (column: string) => {
      if (orderBy === column) {
        setIsDescending((prev) => !prev);
      } else {
        setOrderBy(column);
        setIsDescending(false);
      }
    },
    [orderBy],
  );

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPageIndex(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setFilter(value);
    setPageIndex(1);
  }, []);

  const resetPage = useCallback(() => {
    setPageIndex(1);
    setFilter("");
  }, []);

  return {
    pageIndex,
    setPageIndex,
    pageSize,
    filter,
    orderBy,
    isDescending,
    columnVisibility,
    setColumnVisibility,
    queryParams,
    handleSort,
    handlePageSizeChange,
    handleSearchChange,
    resetPage,
  };
}
