import { useInvoiceDetail } from '../hooks/useInvoices'
import type { InvoiceItemDto } from '../types/invoice.types'
import { INVOICE_ITEM_TYPE, INVOICE_STATUS } from '../types/invoice.types'
import { Ban, Printer } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { PermissionGate } from '@/shared/components/security/PermissionGate'
import { formatCurrency } from '@/shared/utils/currency'

interface Props {
  invoiceId: number
  onCancel: (id: number) => void
}

const ITEM_TYPE_LABEL: Record<number, string> = {
  [INVOICE_ITEM_TYPE.SERVICE]: 'Dịch vụ',
  [INVOICE_ITEM_TYPE.PRODUCT]: 'Sản phẩm',
  [INVOICE_ITEM_TYPE.TREATMENT_COURSE]: 'Liệu trình',
}

export function InvoiceDetailExpanded({ invoiceId, onCancel }: Props) {
  const { data, isLoading } = useInvoiceDetail(invoiceId)
  const inv = data?.data

  if (isLoading) return <div className="p-4 text-sm text-adminGray-600 animate-pulse">Đang tải chi tiết...</div>
  if (!inv) return <div className="p-4 text-sm text-state-danger-text">Không tải được chi tiết.</div>

  const items = inv.items ?? []
  const canCancel = inv.status !== INVOICE_STATUS.CANCELLED && inv.status !== INVOICE_STATUS.REFUNDED

  return (
    <div className="px-6 py-4 bg-adminGray-50/30 border-t border-adminGray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-adminInk font-mono">{inv.invoiceCode}</span>
          <span className="text-xs text-adminGray-600">•</span>
          <span className="text-xs text-adminGray-600">{inv.customerName ?? 'Khách vãng lai'}{inv.customerPhone ? ` (${inv.customerPhone})` : ''}</span>
          {inv.salonName && <><span className="text-xs text-adminGray-600">•</span><span className="text-xs text-adminGray-600">{inv.salonName}</span></>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="text-xs gap-1.5">
            <Printer className="w-3.5 h-3.5" /> In
          </Button>
          {canCancel && inv.id && (
            <PermissionGate resource="invoices" action="update">
              <Button variant="outline" size="sm" onClick={() => onCancel(inv.id!)}
                className="text-xs gap-1.5 text-state-danger-text hover:text-state-danger-text hover:bg-state-danger-bg">
                <Ban className="w-3.5 h-3.5" /> Hủy
              </Button>
            </PermissionGate>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-adminGray-600">Không có dòng nào.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-adminGray-100">
                <th className="text-left py-2 pr-4 text-adminGray-600 font-semibold w-24">Loại</th>
                <th className="text-left py-2 pr-4 text-adminGray-600 font-semibold">Mặt hàng</th>
                <th className="text-right py-2 pr-4 text-adminGray-600 font-semibold w-24">Đơn giá</th>
                <th className="text-center py-2 pr-4 text-adminGray-600 font-semibold w-14">SL</th>
                <th className="text-right py-2 pr-4 text-adminGray-600 font-semibold w-24">Giảm</th>
                <th className="text-right py-2 pr-4 text-adminGray-600 font-semibold w-28">Thành tiền</th>
                <th className="text-left py-2 text-adminGray-600 font-semibold">KTV</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: InvoiceItemDto) => (
                <tr key={item.id} className="border-b border-adminGray-100 last:border-0 hover:bg-adminGray-50/50">
                  <td className="py-2 pr-4 text-adminGray-600">{ITEM_TYPE_LABEL[item.itemType ?? 0] ?? '—'}</td>
                  <td className="py-2 pr-4 text-adminInk font-medium">{item.itemName ?? '—'}</td>
                  <td className="py-2 pr-4 text-right text-adminGray-600">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-2 pr-4 text-center text-adminGray-600">{item.quantity ?? 1}</td>
                  <td className="py-2 pr-4 text-right text-adminGray-600">{formatCurrency(item.discountAmount)}</td>
                  <td className="py-2 pr-4 text-right font-semibold text-adminInk">{formatCurrency(item.lineTotal)}</td>
                  <td className="py-2 text-adminGray-600">{item.staffName ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tổng kết tiền */}
      <div className="mt-4 flex justify-end">
        <div className="w-full sm:w-72 text-xs space-y-1">
          <Row label="Tạm tính" value={formatCurrency(inv.subTotal)} />
          {(inv.discountAmount ?? 0) > 0 && <Row label="Giảm giá" value={`-${formatCurrency(inv.discountAmount)}`} />}
          {(inv.membershipDiscountAmount ?? 0) > 0 && <Row label="Giảm hạng TV" value={`-${formatCurrency(inv.membershipDiscountAmount)}`} />}
          {(inv.loyaltyPointsValue ?? 0) > 0 && <Row label={`Điểm dùng (${inv.loyaltyPointsUsed ?? 0}đ)`} value={`-${formatCurrency(inv.loyaltyPointsValue)}`} />}
          {(inv.taxAmount ?? 0) > 0 && <Row label="Thuế" value={`+${formatCurrency(inv.taxAmount)}`} />}
          <div className="flex justify-between border-t border-adminGray-100 pt-1 text-sm">
            <span className="font-semibold text-adminInk">Tổng</span>
            <strong className="text-adminGreen-600">{formatCurrency(inv.totalAmount)}</strong>
          </div>
          <Row label="Khách trả" value={formatCurrency(inv.paidAmount)} />
          {(inv.changeAmount ?? 0) > 0 && <Row label="Tiền thối" value={formatCurrency(inv.changeAmount)} />}
          {(inv.loyaltyPointsEarned ?? 0) > 0 && <Row label="Điểm tích lũy" value={`+${inv.loyaltyPointsEarned} điểm`} />}
        </div>
      </div>

      {inv.note && <p className="mt-3 text-xs text-adminGray-600 italic">Ghi chú: {inv.note}</p>}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-adminGray-600">{label}</span>
      <span className="text-adminInk">{value}</span>
    </div>
  )
}
