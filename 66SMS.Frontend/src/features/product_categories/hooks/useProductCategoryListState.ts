import { useState, useCallback } from "react";
import { useTableQueryParams } from "@/shared/hooks/useTableQueryParams";
import type { ProductCategoryDTO } from "../types/product_category.types";

export function useProductCategoryListState() {
  const table = useTableQueryParams();
  const [showDeleted, setShowDeleted] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ProductCategoryDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductCategoryDTO | null>(
    null,
  );
  const [restoreTarget, setRestoreTarget] = useState<ProductCategoryDTO | null>(
    null,
  );
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const handleToggleView = useCallback(
    (onClearSelection: () => void) => {
      setShowDeleted((prev) => !prev);
      table.resetPage();
      onClearSelection();
    },
    [table],
  );

  return {
    ...table,
    showDeleted,
    createOpen,
    setCreateOpen,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
    restoreTarget,
    setRestoreTarget,
    bulkDeleteOpen,
    setBulkDeleteOpen,
    handleToggleView,
  };
}
