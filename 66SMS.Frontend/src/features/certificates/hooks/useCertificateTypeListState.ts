import { useState } from "react";
import { useTableQueryParams } from "@/shared/hooks/useTableQueryParams";
import type { CertificateTypeDTO } from "../types/certificate.types";

export function useCertificateTypeListState() {
  const table = useTableQueryParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CertificateTypeDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CertificateTypeDTO | null>(
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
export type CertificateTypeListState = ReturnType<
  typeof useCertificateTypeListState
>;
