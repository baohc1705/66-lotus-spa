import { useState, useCallback } from "react";
import { useTableQueryParams } from "@/shared/hooks/useTableQueryParams";
import type { ProductDto } from "../types/product.types";

export function useProductListState() {
  const table = useTableQueryParams();
  const [showDeleted, setShowDeleted] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ProductDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductDto | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<ProductDto | null>(null);
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
