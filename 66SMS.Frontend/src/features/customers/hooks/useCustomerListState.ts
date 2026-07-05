import { useState } from "react";
import { useTableQueryParams } from "@/shared/hooks/useTableQueryParams";
import type { CustomerDto } from "../types/customer.types";

export function useCustomerListState() {
  const tableParams = useTableQueryParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CustomerDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomerDto | null>(null);

  return {
    ...tableParams,
    createOpen,
    setCreateOpen,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
  };
}
