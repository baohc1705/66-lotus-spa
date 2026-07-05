import { useState, useEffect } from "react";
import { useTableQueryParams } from "@/shared/hooks/useTableQueryParams";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { StaffDto } from "../types/staff.types";

export function useStaffListState() {
  const table = useTableQueryParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffDto | null>(null);

  const salonId = useAuthStore((s) => s.getEffectiveSalonId());

  // Reset pageIndex when salonId changes
  useEffect(() => {
    table.resetPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonId]);

  return {
    ...table,
    salonId,
    createOpen,
    setCreateOpen,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
  };
}
