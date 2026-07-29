import { useState } from "react";
import { useTableQueryParams } from "@/shared/hooks/useTableQueryParams";
import type { ConfigAppointmentDTO } from "../types/config_appointment.types";

export function useConfigAppointmentListState() {
  const table = useTableQueryParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ConfigAppointmentDTO | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<ConfigAppointmentDTO | null>(
    null,
  );

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
