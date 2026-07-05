import { useState, useCallback } from "react";

export function useRowSelection(pageIds: number[]) {
  const [selectedRowIds, setSelectedRowIds] = useState<Set<number>>(new Set());

  const isAllSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedRowIds.has(id));
  const isSomeSelected = pageIds.some((id) => selectedRowIds.has(id));
  const headerChecked: boolean | "indeterminate" = isAllSelected
    ? true
    : isSomeSelected
      ? "indeterminate"
      : false;

  const clearSelection = useCallback(() => {
    setSelectedRowIds(new Set());
  }, []);

  const toggleAll = useCallback(
    (checked: boolean | "indeterminate") => {
      const newSet = new Set(selectedRowIds);
      if (headerChecked === "indeterminate" || checked === false) {
        pageIds.forEach((id) => newSet.delete(id));
      } else if (checked === true) {
        pageIds.forEach((id) => newSet.add(id));
      }
      setSelectedRowIds(newSet);
    },
    [headerChecked, pageIds, selectedRowIds],
  );

  const toggleOne = useCallback(
    (id: number, checked: boolean) => {
      const newSet = new Set(selectedRowIds);
      if (checked) newSet.add(id);
      else newSet.delete(id);
      setSelectedRowIds(newSet);
    },
    [selectedRowIds],
  );

  return {
    selectedRowIds,
    setSelectedRowIds,
    clearSelection,
    headerChecked,
    toggleAll,
    toggleOne,
    selectedCount: selectedRowIds.size,
  };
}
