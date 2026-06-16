import { Pencil, CreditCard, User, Crown, Calendar, CalendarClock } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { PermissionGate } from '@/shared/components/security/PermissionGate'
import { useMembershipCardDetail } from '../hooks/useMembershipCards'
import type { MembershipCardDto } from '../types/membershipCard.types'

const STATUS_MAP: Record<number, string> = {
  0: 'Ngưng hoạt động',
  1: 'Hoạt động',
  2: 'Tạm khóa',
}

interface MembershipCardDetailExpandedProps {
  cardId: number
  onEdit?: (card: MembershipCardDto) => void
}

export function MembershipCardDetailExpanded({ cardId, onEdit }: MembershipCardDetailExpandedProps) {
  const { data: result, isLoading } = useMembershipCardDetail(cardId)
  const card = result?.data

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 bg-stone-50/30">
        <Skeleton className="w-48 h-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      </div>
    )
  }

  if (!card) {
    return <div className="p-6 text-center text-lotus-stone text-sm bg-stone-50/30">Không tìm thấy thông tin thẻ thành viên</div>
  }

  return (
    <div className="bg-stone-50/30 w-full overflow-hidden p-6 border-t border-stone-200/50">
      <div className="flex flex-col gap-5">
        {/* Header info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center shrink-0 shadow-sm border border-violet-200/50">
            <CreditCard className="w-6 h-6 text-violet-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-lotus-deep truncate">Mã thẻ: {card.cardCode}</h3>
            <p className="text-[12px] font-medium text-lotus-stone mt-0.5">
              Trạng thái: <span className={card.status === 1 ? 'text-green-600' : 'text-amber-600'}>{STATUS_MAP[card.status] ?? 'Không rõ'}</span>
            </p>
          </div>
          <PermissionGate resource="customers" action="update">
            <Button variant="admin" size="sm" onClick={() => onEdit?.(card)} className="bg-lotus-leaf hover:opacity-90 text-white shadow-sm h-8 px-4 text-[13px] gap-1.5 rounded-md transition-opacity shrink-0">
              <Pencil className="w-3.5 h-3.5" />
              Chỉnh sửa
            </Button>
          </PermissionGate>
        </div>

        {/* Grid info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <DetailCard icon={User} label="Khách hàng" value={card.customerName ?? '—'} />
          <DetailCard icon={Crown} label="Loại thẻ" value={card.tierName ?? '—'} />
          <DetailCard icon={Calendar} label="Ngày cấp" value={card.issuedAt ? new Date(card.issuedAt).toLocaleDateString('vi-VN') : '—'} />
          <DetailCard icon={CalendarClock} label="Ngày hết hạn" value={card.expiresAt ? new Date(card.expiresAt).toLocaleDateString('vi-VN') : 'Vĩnh viễn'} />
        </div>
      </div>
    </div>
  )
}

function DetailCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg p-3 border border-stone-100 shadow-sm flex items-start gap-3">
      <div className="w-8 h-8 rounded-md bg-stone-50 flex items-center justify-center shrink-0 text-lotus-stone">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-lotus-stone truncate mb-0.5">{label}</p>
        <p className="text-[14px] font-semibold text-lotus-deep truncate">{value}</p>
      </div>
    </div>
  )
}
