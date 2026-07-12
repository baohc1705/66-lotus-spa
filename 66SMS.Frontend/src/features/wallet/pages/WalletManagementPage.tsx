import { formatCurrency } from '@/shared/utils/currency';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdminWallets } from '../api/wallet.api';
import type { AdminWalletDto } from '../types/wallet.types';
import { WalletTransactionModal } from '../components/WalletTransactionModal';
import { Wallet } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { DataTableToolbar } from '@/shared/components/DataTable/DataTableToolbar';
import { getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { motion } from 'motion/react';
import { containerVariants } from '@/shared/motion/pageVariants';
import { DEFAULT_LOADING_ROWS } from '@/shared/constants/display.const';

const WALLET_STATUS_MAP: Record<number, { label: string; className: string }> = {
  1: { label: "Hoạt động", className: "bg-state-success-bg text-state-success-text border-state-success-border" },
  2: { label: "Đang khóa", className: "bg-state-danger-bg text-state-danger-text border-state-danger-border" },
  3: { label: "Đã đóng", className: "bg-state-neutral-bg text-state-neutral-text border-state-neutral-border" },
};

export function WalletManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<{ id: number; name: string } | null>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-wallets'],
    queryFn: getAdminWallets,
  });

  const wallets = useMemo(() => response?.data || [], [response]);

  const filteredWallets = useMemo(() => {
    return wallets.filter((w: AdminWalletDto) =>
      (w.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.customerPhone || '').includes(searchTerm)
    );
  }, [wallets, searchTerm]);

  const columns = useMemo<ColumnDef<AdminWalletDto>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => (
          <span className="text-adminGray-600 text-xs font-medium">
            {row.index + 1}
          </span>
        ),
        size: 50,
      },
      {
        accessorKey: "id",
        header: "Mã ví",
        cell: ({ row }) => (
          <span className="text-2xs font-mono font-bold text-adminGray-600">
            #{row.original.id}
          </span>
        ),
        size: 70,
      },
      {
        accessorKey: "customerId",
        header: "Mã KH",
        cell: ({ row }) => (
          <span className="text-2xs font-mono text-adminGray-600">
            #{row.original.customerId}
          </span>
        ),
        size: 70,
      },
      {
        accessorKey: "customerName",
        header: "Khách hàng",
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-adminGreen-600-light/35 flex items-center justify-center text-adminGreen-600 font-bold shrink-0 text-xs uppercase">
              {(row.original.customerName || 'K').charAt(0)}
            </div>
            <span className="text-sm font-semibold text-adminInk">
              {row.original.customerName}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "customerPhone",
        header: "Số điện thoại",
        cell: ({ row }) => (
          <span className="text-adminInk/80 text-xs">
            {row.original.customerPhone}
          </span>
        ),
      },
      {
        accessorKey: "balance",
        header: "Số dư ví",
        cell: ({ row }) => (
          <span className="font-bold text-adminGreen-600 text-sm">
            {formatCurrency(row.original.balance)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => {
          const statusVal = row.original.status;
          const statusInfo = WALLET_STATUS_MAP[statusVal] || { label: "Không rõ", className: "bg-adminGray-50 text-adminInk border-adminGray-100/50" };
          return (
            <span className={`text-2xs font-bold px-1.5 py-0.5 rounded border ${statusInfo.className}`}>
              {statusInfo.label}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Ngày tạo ví",
        cell: ({ row }) => (
          <span className="text-adminGray-600 text-2xs">
            {new Date(row.original.createdAt).toLocaleDateString('vi-VN')}
          </span>
        ),
      },
      {
        id: "updatedAt",
        header: "Cập nhật lần cuối",
        cell: ({ row }) => (
          <span className="text-adminGray-600 text-2xs">
            {new Date(row.original.updatedAt || row.original.createdAt).toLocaleString('vi-VN')}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end pr-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-adminGreen-600 hover:text-adminGreen-600/80 font-bold text-xs h-8 hover:bg-adminGreen-50"
              onClick={() => setSelectedWallet({ id: row.original.id, name: row.original.customerName })}
            >
              Chi tiết
            </Button>
          </div>
        ),
        size: 90,
      },
    ],
    [setSelectedWallet]
  );

  const table = useReactTable({
    data: filteredWallets,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-2 h-full overflow-hidden w-full">
      {/* Header section */}
      <div className="shrink-0 bg-white p-4 rounded border border-adminGray-100/30 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-adminGreen-600-light/20 text-adminGreen-600 rounded-xl">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-adminInk leading-tight">
              Quản lý Ví Khách Hàng
            </h1>
            <p className="text-xs text-adminGray-600 mt-0.5">
              Xem danh sách ví của khách hàng và quản lý các giao dịch nạp / trừ tiền thủ công.
            </p>
          </div>
        </div>
      </div>

      {/* Table Card wrapper */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="lotus-admin-table-page-card flex-1 min-h-0 flex flex-col overflow-hidden relative"
      >
        {/* Toolbar */}
        <div className="px-4 pt-3 shrink-0">
          <DataTableToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Tìm theo tên hoặc số điện thoại..."
          />
        </div>

        {/* Table */}
        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={DEFAULT_LOADING_ROWS}
          emptyState={
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-adminGray-50 flex items-center justify-center">
                <Wallet className="w-7 h-7 text-adminGray-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-adminInk">
                  Không tìm thấy dữ liệu ví
                </p>
                <p className="text-xs text-adminGray-600 mt-0.5">
                  Hãy thử thay đổi từ khóa tìm kiếm khác.
                </p>
              </div>
            </div>
          }
        />
      </motion.div>

      <WalletTransactionModal
        walletId={selectedWallet?.id || null}
        customerName={selectedWallet?.name || ''}
        isOpen={!!selectedWallet}
        onClose={() => setSelectedWallet(null)}
      />
    </div>
  );
}
