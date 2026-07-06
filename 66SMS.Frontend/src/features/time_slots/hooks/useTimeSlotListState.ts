import { useState } from "react";
import { useTableQueryParams } from "@/shared/hooks/useTableQueryParams";
import type { TimeSlotDTO } from "../types/time_slot.types";

export function useTimeSlotListState() {
  const table = useTableQueryParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TimeSlotDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TimeSlotDTO | null>(null);

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
