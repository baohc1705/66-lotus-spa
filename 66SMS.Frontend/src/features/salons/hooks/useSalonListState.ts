import { useState } from "react";
import { useTableQueryParams } from "@/shared/hooks/useTableQueryParams";
import type { SalonDTO } from "../types/salon.types";

export function useSalonListState() {
  const table = useTableQueryParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SalonDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SalonDTO | null>(null);

  return {
    ...table,
    createOpen,
    setCreateOpen,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
  };
}
