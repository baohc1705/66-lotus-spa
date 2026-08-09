import { useState } from "react";
import type { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDownLeft, ArrowUpRight, Plus } from "lucide-react";

import { Modal } from "@/shared/components/Modal";
import { toast } from "@/shared/components/kitToast";
import { Badge, type BadgeVariant } from "@/shared/elements/Badge";
import { Button } from "@/shared/elements/Button";
import { Card, CardBody } from "@/shared/elements/Card";
import { FormField } from "@/shared/forms/FormField";
import { FormRow } from "@/shared/forms/FormRow";
import { FormSection } from "@/shared/forms/FormSection";
import { Input } from "@/shared/forms/Input";
import type { Result } from "@/shared/types/common.types";
import { formatCurrency } from "@/shared/utils/currency";
import { formatDateTimeDisplay } from "@/shared/utils/date.utils";

import {
  addManualTransaction,
  getAdminWalletTransactions,
} from "../api/wallet.api";
import type { AdminWalletTransactionDto } from "../types/wallet.types";

interface WalletTransactionModalProps {
  walletId: number | null;
  customerName: string;
  isOpen: boolean;
  onClose: () => void;
}

function getTypeBadge(type: number): { label: string; variant: BadgeVariant } {
  if (type === 1) return { label: "Hoàn tiền", variant: "info" };
  if (type === 2) return { label: "Thanh toán", variant: "primary" };
  if (type === 3) return { label: "Nạp tiền", variant: "success" };
  if (type === 4) return { label: "Thủ công", variant: "warning" };
  return { label: "Khác", variant: "secondary" };
}

function getStatusBadge(status: number): {
  label: string;
  variant: BadgeVariant;
} {
  if (status === 1) return { label: "Thành công", variant: "success" };
  if (status === 2) return { label: "Thất bại", variant: "danger" };
  if (status === 3) return { label: "Đã đảo", variant: "secondary" };
  return { label: "Không rõ", variant: "secondary" };
}

export function WalletTransactionModal({
  walletId,
  customerName,
  isOpen,
  onClose,
}: WalletTransactionModalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ["admin-wallet-transactions", walletId],
    queryFn: () => getAdminWalletTransactions(walletId!),
    enabled: !!walletId && isOpen,
  });

  const addTransactionMutation = useMutation({
    mutationFn: (data: { amount: number; note: string }) =>
      addManualTransaction(walletId!, data),
    onSuccess: () => {
      toast.success("Giao dịch thành công");
      queryClient.invalidateQueries({
        queryKey: ["admin-wallet-transactions", walletId],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-wallets"] });
      setIsAdding(false);
      setAmount("");
      setNote("");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      const message = error.response?.data?.message ?? "Có lỗi xảy ra";
      toast.error(message);
    },
  });

  const transactions = response?.data || [];

  function handleAddSubmit(event: { preventDefault(): void }) {
    event.preventDefault();
    const value = Number(amount.replace(/[^0-9-]/g, ""));
    if (!value || value === 0) {
      toast.error("Số tiền không hợp lệ");
      return;
    }
    addTransactionMutation.mutate({ amount: value, note });
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={`Chi tiết ví: ${customerName}`}
      size="lg"
      scrollable
      fullHeight
    >
      <p className="mb-3 text-sm text-kit-muted">
        Lịch sử giao dịch và biến động số dư của ví khách hàng.
      </p>

      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="m-0 text-sm font-semibold text-kit-heading">
          Lịch sử giao dịch
        </h3>
        <Button
          type="button"
          variant="admin"
          size="sm"
          className="mb-0"
          onClick={() => setIsAdding(!isAdding)}
        >
          <Plus className="mr-1 h-4 w-4" />
          Nạp / Trừ tiền
        </Button>
      </div>

      {isAdding ? (
        <Card className="mb-4 shadow-none">
          <CardBody className="p-3">
            <form onSubmit={handleAddSubmit}>
              <FormSection title="Nạp / Trừ tiền thủ công">
                <FormRow>
                  <FormField label="Số tiền (âm để trừ tiền)">
                    <Input
                      type="number"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      placeholder="VD: 500000 hoặc -500000"
                      required
                    />
                  </FormField>
                  <FormField label="Ghi chú">
                    <Input
                      type="text"
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      placeholder="Lý do..."
                      required
                    />
                  </FormField>
                </FormRow>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="mb-0"
                    onClick={() => setIsAdding(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    variant="admin"
                    size="sm"
                    className="mb-0"
                    loading={addTransactionMutation.isPending}
                  >
                    Xác nhận
                  </Button>
                </div>
              </FormSection>
            </form>
          </CardBody>
        </Card>
      ) : null}

      {isLoading ? (
        <p className="py-10 text-center text-sm text-kit-muted">
          Đang tải giao dịch...
        </p>
      ) : transactions.length === 0 ? (
        <p className="rounded border border-dashed border-kit py-10 text-center text-sm text-kit-muted">
          Chưa có giao dịch nào.
        </p>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx: AdminWalletTransactionDto) => {
            const isPositive = tx.amount > 0;
            const typeInfo = getTypeBadge(tx.type);
            const statusInfo = getStatusBadge(tx.status);
            const noteText =
              tx.note && !tx.note.startsWith("TxnRef:")
                ? tx.note
                : typeInfo.label;

            return (
              <Card key={tx.id} className="mb-0 shadow-none">
                <CardBody className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className={
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full " +
                          (isPositive
                            ? "bg-state-success-bg text-state-success-text"
                            : "bg-state-danger-bg text-state-danger-text")
                        }
                      >
                        {isPositive ? (
                          <ArrowDownLeft className="h-5 w-5" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono text-xs text-kit-muted">
                            #{tx.id}
                          </span>
                          <Badge variant={typeInfo.variant} soft>
                            {typeInfo.label}
                          </Badge>
                          <Badge variant={statusInfo.variant} soft>
                            {statusInfo.label}
                          </Badge>
                          {tx.appointmentPaymentId ? (
                            <Badge variant="light">
                              Thanh toán: #{tx.appointmentPaymentId}
                            </Badge>
                          ) : null}
                        </div>
                        <p className="mb-0 mt-1 text-sm font-semibold text-kit-heading">
                          {noteText}
                        </p>
                        <p className="mb-0 mt-0.5 text-xs text-kit-muted">
                          {formatDateTimeDisplay(tx.createdAt)} · Bởi:{" "}
                          {tx.createdByName}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div
                        className={
                          "text-sm font-bold " +
                          (isPositive
                            ? "text-state-success-text"
                            : "text-state-danger-text")
                        }
                      >
                        {isPositive ? "+" : ""}
                        {formatCurrency(tx.amount)}
                      </div>
                      <div className="mt-0.5 text-xs text-kit-muted">
                        Số dư sau: {formatCurrency(tx.balanceAfter)}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
