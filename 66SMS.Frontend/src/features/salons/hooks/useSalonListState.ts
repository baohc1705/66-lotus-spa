import { useState } from "react";
import { useTableQueryParams } from "@/shared/hooks/useTableQueryParams";
import type { SalonListItem } from "../types/salon.types";

export function useSalonListState() {
  const table = useTableQueryParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [editSalonId, setEditSalonId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SalonListItem | null>(null);

  return {
    ...table,
    createOpen,
    setCreateOpen,
    editSalonId,
    setEditSalonId,
    deleteTarget,
    setDeleteTarget,
  };
}
