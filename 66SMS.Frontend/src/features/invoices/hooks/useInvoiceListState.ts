import { useState, useCallback, useEffect, useRef } from "react";
import { useTableQueryParams } from "@/shared/hooks/useTableQueryParams";

export function useInvoiceListState(salonId: number | null) {
  const table = useTableQueryParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);

  // Filter Sidebar State
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | null>(null);

  const prevSalonId = useRef(salonId);
  useEffect(() => {
    if (salonId !== prevSalonId.current) {
      table.resetPage();
      prevSalonId.current = salonId;
    }
  }, [salonId, table]);

  const handleSelectStatus = useCallback(
    (status: number | null) => {
      setSelectedStatus(status);
      table.resetPage();
    },
    [table],
  );

  const handleSelectPaymentMethod = useCallback(
    (method: number | null) => {
      setSelectedPaymentMethod(method);
      table.resetPage();
    },
    [table],
  );

  const handleResetFilters = useCallback(() => {
    setSelectedStatus(null);
    setSelectedPaymentMethod(null);
    table.resetPage();
  }, [table]);

  const queryParams = {
    ...table.queryParams,
    salonId: salonId || undefined,
    status: selectedStatus ?? undefined,
    paymentMethod: selectedPaymentMethod ?? undefined,
  };

  return {
    ...table,
    queryParams,
    createOpen,
    setCreateOpen,
    cancelTarget,
    setCancelTarget,
    selectedStatus,
    selectedPaymentMethod,
    handleSelectStatus,
    handleSelectPaymentMethod,
    handleResetFilters,
  };
}
