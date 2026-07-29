import { useState, useCallback } from "react";
import { useTableQueryParams } from "@/shared/hooks/useTableQueryParams";
import type { StaffCertificateDTO } from "../types/certificate.types";

export function useStaffCertificateListState() {
  const table = useTableQueryParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffCertificateDTO | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<StaffCertificateDTO | null>(
    null,
  );
  const [selectedCertificateTypeId, setSelectedCertificateTypeId] = useState<
    number | null
  >(null);

  const handleSelectType = useCallback(
    (id: number | null) => {
      setSelectedCertificateTypeId(id);
      table.setPageIndex(1);
    },
    [table],
  );

  const queryParams = {
    ...table.queryParams,
    ...(selectedCertificateTypeId != null
      ? { certificateTypeId: selectedCertificateTypeId }
      : {}),
  };

  return {
    ...table,
    queryParams,
    createOpen,
    setCreateOpen,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
    selectedCertificateTypeId,
    setSelectedCertificateTypeId: handleSelectType,
  };
}
export type StaffCertificateListState = ReturnType<
  typeof useStaffCertificateListState
>;
