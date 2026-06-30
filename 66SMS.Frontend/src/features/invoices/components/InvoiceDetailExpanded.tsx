import { useInvoiceDetail } from '../hooks/useInvoices'
import type { InvoiceItemDto } from '../types/invoice.types'
import { INVOICE_ITEM_TYPE, INVOICE_STATUS } from '../types/invoice.types'
import { Ban, Printer } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { PermissionGate } from '@/shared/components/security/PermissionGate'

interface Props {
  invoiceId: number
  onCancel: (id: number) => void
}

const ITEM_TYPE_LABEL: Record<number, string> = {
  [INVOICE_ITEM_TYPE.SERVICE]: 'Dịch vụ',
  [INVOICE_ITEM_TYPE.PRODUCT]: 'Sản phẩm',
  [INVOICE_ITEM_TYPE.TREATMENT_COURSE]: 'Liệu trình',
}

const fmt = (n: number | null | undefined) => (n ?? 0).toLocaleString('vi-VN') + 'đ'

export function InvoiceDetailExpanded({ invoiceId, onCancel }: Props) {
  const { data, isLoading } = useInvoiceDetail(invoiceId)
  const inv = data?.data

  if (isLoading) return <div className="p-4 text-[13px] text-lotus-stone animate-pulse">Đang tải chi tiết...</div>
  if (!inv) return <div className="p-4 text-[13px] text-red-400">Không tải được chi tiết.</div>

  const items = inv.items ?? []
  const canCancel = inv.status !== INVOICE_STATUS.CANCELLED && inv.status !== INVOICE_STATUS.REFUNDED

  return (
    <div className="px-6 py-4 bg-lotus-cream/30 border-t border-stone-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[12px] font-semibold text-lotus-deep font-mono">{inv.invoiceCode}</span>
          <span className="text-[11px] text-lotus-stone">•</span>
          <span className="text-[12px] text-lotus-stone">{inv.customerName ?? 'Khách vãng lai'}{inv.customerPhone ? ` (${inv.customerPhone})` : ''}</span>
          {inv.salonName && <><span className="text-[11px] text-lotus-stone">•</span><span className="text-[12px] text-lotus-stone">{inv.salonName}</span></>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="text-[12px] gap-1.5">
            <Printer className="w-3.5 h-3.5" /> In
          </Button>
          {canCancel && inv.id && (
            <PermissionGate resource="invoices" action="update">
              <Button variant="outline" size="sm" onClick={() => onCancel(inv.id!)}
                className="text-[12px] gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50">
                <Ban className="w-3.5 h-3.5" /> Hủy
              </Button>
            </PermissionGate>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-[13px] text-lotus-stone">Không có dòng nào.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="text-left py-2 pr-4 text-lotus-stone font-semibold w-24">Loại</th>
                <th className="text-left py-2 pr-4 text-lotus-stone font-semibold">Mặt hàng</th>
                <th className="text-right py-2 pr-4 text-lotus-stone font-semibold w-24">Đơn giá</th>
                <th className="text-center py-2 pr-4 text-lotus-stone font-semibold w-14">SL</th>
                <th className="text-right py-2 pr-4 text-lotus-stone font-semibold w-24">Giảm</th>
                <th className="text-right py-2 pr-4 text-lotus-stone font-semibold w-28">Thành tiền</th>
                <th className="text-left py-2 text-lotus-stone font-semibold">KTV</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: InvoiceItemDto) => (
                <tr key={item.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50">
                  <td className="py-2 pr-4 text-lotus-stone">{ITEM_TYPE_LABEL[item.itemType ?? 0] ?? '—'}</td>
                  <td className="py-2 pr-4 text-lotus-deep font-medium">{item.itemName ?? '—'}</td>
                  <td className="py-2 pr-4 text-right text-lotus-stone">{fmt(item.unitPrice)}</td>
                  <td className="py-2 pr-4 text-center text-lotus-stone">{item.quantity ?? 1}</td>
                  <td className="py-2 pr-4 text-right text-lotus-stone">{fmt(item.discountAmount)}</td>
                  <td className="py-2 pr-4 text-right font-semibold text-lotus-deep">{fmt(item.lineTotal)}</td>
                  <td className="py-2 text-lotus-stone">{item.staffName ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tổng kết tiền */}
      <div className="mt-4 flex justify-end">
        <div className="w-full sm:w-72 text-[12px] space-y-1">
          <Row label="Tạm tính" value={fmt(inv.subTotal)} />
          {(inv.discountAmount ?? 0) > 0 && <Row label="Giảm giá" value={`-${fmt(inv.discountAmount)}`} />}
          {(inv.membershipDiscountAmount ?? 0) > 0 && <Row label="Giảm hạng TV" value={`-${fmt(inv.membershipDiscountAmount)}`} />}
          {(inv.loyaltyPointsValue ?? 0) > 0 && <Row label={`Điểm dùng (${inv.loyaltyPointsUsed ?? 0}đ)`} value={`-${fmt(inv.loyaltyPointsValue)}`} />}
          {(inv.taxAmount ?? 0) > 0 && <Row label="Thuế" value={`+${fmt(inv.taxAmount)}`} />}
          <div className="flex justify-between border-t border-stone-200 pt-1 text-[14px]">
            <span className="font-semibold text-lotus-deep">Tổng</span>
            <strong className="text-lotus-leaf">{fmt(inv.totalAmount)}</strong>
          </div>
          <Row label="Khách trả" value={fmt(inv.paidAmount)} />
          {(inv.changeAmount ?? 0) > 0 && <Row label="Tiền thối" value={fmt(inv.changeAmount)} />}
          {(inv.loyaltyPointsEarned ?? 0) > 0 && <Row label="Điểm tích lũy" value={`+${inv.loyaltyPointsEarned} điểm`} />}
        </div>
      </div>

      {inv.note && <p className="mt-3 text-[12px] text-lotus-stone italic">Ghi chú: {inv.note}</p>}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-lotus-stone">{label}</span>
      <span className="text-lotus-deep">{value}</span>
    </div>
  )
}
