import { DoorOpen, Pencil, MapPin } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { PermissionGate } from '@/shared/components/security/PermissionGate'
import { StatusBadge, type StatusMap } from '@/shared/components/StatusBadge'
import { useBookingRoomDetail } from '../hooks/useBookingRooms'
import type { BookingRoomDTO } from '../types/booking_room.types'

interface BookingRoomDetailExpandedProps {
  roomId: number
  onEdit?: (room: BookingRoomDTO) => void
}

const POSITION_STATUS_MAP: StatusMap = {
  '0': { label: 'Bảo trì', variant: 'error' },
  '1': { label: 'Khả dụng', variant: 'success', dot: true },
}

export function BookingRoomDetailExpanded({ roomId, onEdit }: BookingRoomDetailExpandedProps) {
  const { data: result, isLoading } = useBookingRoomDetail(roomId)
  const room = result?.data

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 bg-stone-50/30">
        <div className="flex gap-4 mb-4">
          <Skeleton className="w-24 h-8" />
          <Skeleton className="w-24 h-8" />
        </div>
        <Skeleton className="w-48 h-6" />
        <div className="grid grid-cols-2 gap-8">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    )
  }

  if (!room) {
    return <div className="p-6 text-center text-lotus-stone text-sm bg-stone-50/30">Không tìm thấy thông tin phòng dịch vụ</div>
  }

  const positions = room.positions || []

  return (
    <div className="bg-stone-50/30 w-full overflow-hidden max-h-[400px] overflow-y-auto custom-scrollbar">
      <Tabs defaultValue="info" className="w-full flex-col">
        {/* Tab Headers */}
        <div className="px-4 pt-2 sticky top-0 bg-stone-50/95 backdrop-blur-sm z-10">
          <TabsList className="h-10 border-b border-stone-200/80 justify-start rounded-none bg-transparent p-0 flex flex-nowrap overflow-x-auto overflow-y-hidden hide-scrollbar">
            <TabsTrigger value="info" className="relative h-10 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 pb-2 pt-2 text-[13px] font-medium text-lotus-stone hover:text-lotus-leaf/80 data-[state=active]:border-lotus-leaf data-[state=active]:text-lotus-leaf data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:outline-none whitespace-nowrap transition-colors">Thông tin chung</TabsTrigger>
            <TabsTrigger value="positions" className="relative h-10 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 pb-2 pt-2 text-[13px] font-medium text-lotus-stone hover:text-lotus-leaf/80 data-[state=active]:border-lotus-leaf data-[state=active]:text-lotus-leaf data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:outline-none whitespace-nowrap transition-colors">Danh sách vị trí ({positions.length})</TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content - Info */}
        <TabsContent value="info" className="p-4 m-0 border-none outline-none">
          <div className="flex flex-col gap-4">
            {/* Header info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-lotus-cream/50 flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-stone-200/50">
                {room.imageUrl ? (
                  <img src={room.imageUrl} alt={room.name ?? ''} className="w-full h-full object-cover" />
                ) : (
                  <DoorOpen className="w-7 h-7 text-lotus-stone" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-lotus-deep truncate">{room.name ?? '—'}</h3>
                <p className="text-[12px] text-lotus-stone mt-0.5">
                  Trạng thái: {room.status === 1 ? 'Hoạt động' : 'Ngưng hoạt động'}
                </p>
              </div>
            </div>

            {/* Grid for fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
              <div className="flex flex-col">
                <DetailField label="Tên phòng" value={room.name} />
                <DetailField label="Ngày tạo" value={room.createdAt} />
              </div>
              <div className="flex flex-col">
                <DetailField label="Ghi chú" value={room.note} />
                <DetailField label="Cập nhật lần cuối" value={room.updatedAt} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-end justify-end mt-2 pt-4 border-t border-stone-100/80">
              <PermissionGate resource="booking_rooms" action="update">
                <Button variant="admin" size="sm" onClick={() => onEdit?.(room)} className="bg-lotus-leaf hover:opacity-90 text-white shadow-sm h-8 px-4 text-[13px] gap-1.5 rounded-md transition-opacity">
                  <Pencil className="w-3.5 h-3.5" />
                  Cập nhật
                </Button>
              </PermissionGate>
            </div>
          </div>
        </TabsContent>

        {/* Tab Content - Positions */}
        <TabsContent value="positions" className="p-4 m-0 border-none outline-none">
          {positions.length === 0 ? (
            <div className="py-8 text-center text-lotus-stone text-sm">Chưa có vị trí nào được thiết lập trong phòng này</div>
          ) : (
            <div className="rounded-md border border-stone-200 overflow-hidden">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-stone-50 border-b border-stone-200 text-lotus-stone">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold w-16 text-center">Thứ tự</th>
                    <th className="py-2.5 px-4 font-semibold">Tên vị trí</th>
                    <th className="py-2.5 px-4 font-semibold">Trạng thái</th>
                    <th className="py-2.5 px-4 font-semibold">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white">
                  {positions.map((pos) => (
                    <tr key={pos.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-lotus-stone text-center">{pos.sortOrder ?? '-'}</td>
                      <td className="py-2.5 px-4 font-medium text-lotus-deep">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-lotus-leaf/70" />
                          {pos.name}
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <StatusBadge status={pos.status?.toString()} statusMap={POSITION_STATUS_MAP} />
                      </td>
                      <td className="py-2.5 px-4 text-lotus-stone truncate max-w-[200px]" title={pos.note}>{pos.note || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DetailField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="py-3.5 border-b border-stone-100/80 last:border-b-0 group">
      <p className="text-[12px] text-lotus-stone mb-1">{label}</p>
      <p className="text-[13px] font-medium text-lotus-deep truncate">{value || '—'}</p>
    </div>
  )
}
