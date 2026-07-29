import { useState, useCallback } from "react";
import { useTableQueryParams } from "@/shared/hooks/useTableQueryParams";
import { StatusActive } from "@/shared/constants/status.enum";
import type { CustomerDto } from "../types/customer.types";

export function useCustomerListState() {
  const table = useTableQueryParams();
  const [showDeleted, setShowDeleted] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CustomerDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomerDto | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<CustomerDto | null>(null);

  const [selectedGender, setSelectedGender] = useState<number | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  const handleToggleView = useCallback(
    (onClearSelection: () => void) => {
      setShowDeleted((prev) => !prev);
      table.resetPage();
      setSelectedGender(null);
      setSelectedSource(null);
      onClearSelection();
    },
    [table],
  );

  const queryParams = {
    ...table.queryParams,
    status: showDeleted ? StatusActive.Deleted : StatusActive.Active,
    ...(selectedGender != null ? { gender: selectedGender } : {}),
    ...(selectedSource ? { source: selectedSource } : {}),
  };

  return {
    ...table,
    queryParams,
    showDeleted,
    createOpen,
    setCreateOpen,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
    restoreTarget,
    setRestoreTarget,
    handleToggleView,
    selectedGender,
    setSelectedGender,
    selectedSource,
    setSelectedSource,
  };
}
