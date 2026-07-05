import { useState } from "react";
import { useTableQueryParams } from "@/shared/hooks/useTableQueryParams";
import type { MembershipTierDto } from "../types/membershipTier.types";

export function useMembershipTierListState() {
  const tableParams = useTableQueryParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<MembershipTierDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MembershipTierDto | null>(null);

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
