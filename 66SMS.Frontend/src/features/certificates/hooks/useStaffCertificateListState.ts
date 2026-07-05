import { useState } from "react";
import { useTableQueryParams } from "@/shared/hooks/useTableQueryParams";
import type { StaffCertificateDTO } from "../types/certificate.types";

export function useStaffCertificateListState() {
  const table = useTableQueryParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffCertificateDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffCertificateDTO | null>(
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
export type StaffCertificateListState = ReturnType<typeof useStaffCertificateListState>;
