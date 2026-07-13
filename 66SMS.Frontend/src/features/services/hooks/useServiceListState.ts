import { useState, useCallback } from "react";
import { useTableQueryParams } from "@/shared/hooks/useTableQueryParams";
import type { ServiceListDto } from "../types/service.types";

export function useServiceListState() {
  const table = useTableQueryParams();
  const [showDeleted, setShowDeleted] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ServiceListDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceListDto | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<ServiceListDto | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

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
    selectedCategoryId,
    setSelectedCategoryId,
  };
}
