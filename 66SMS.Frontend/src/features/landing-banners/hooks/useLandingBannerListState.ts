import { useState } from "react";
import { useTableQueryParams } from "@/shared/hooks/useTableQueryParams";
import type { LandingBannerDto } from "../types/landing-banner.types";

export function useLandingBannerListState() {
  const table = useTableQueryParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [editBannerId, setEditBannerId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LandingBannerDto | null>(null);

  return {
    ...table,
    createOpen,
    setCreateOpen,
    editBannerId,
    setEditBannerId,
    deleteTarget,
    setDeleteTarget,
  };
}
