import { useState } from "react";
import { useTableQueryParams } from "@/shared/hooks/useTableQueryParams";
import type { MembershipCardDto } from "../types/membershipCard.types";

export function useMembershipCardListState() {
  const tableParams = useTableQueryParams();
  const [editTarget, setEditTarget] = useState<MembershipCardDto | null>(null);

  return {
    ...tableParams,
    editTarget,
    setEditTarget,
  };
}
