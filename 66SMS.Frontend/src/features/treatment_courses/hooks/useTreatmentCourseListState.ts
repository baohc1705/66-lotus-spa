import { useState, useCallback } from "react";
import { useTableQueryParams } from "@/shared/hooks/useTableQueryParams";
import type { TreatmentCourseDto } from "../types/treatmentCourse.types";

export function useTreatmentCourseListState() {
  const table = useTableQueryParams();
  const [showDeleted, setShowDeleted] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TreatmentCourseDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TreatmentCourseDto | null>(
    null,
  );
  const [restoreTarget, setRestoreTarget] = useState<TreatmentCourseDto | null>(
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
