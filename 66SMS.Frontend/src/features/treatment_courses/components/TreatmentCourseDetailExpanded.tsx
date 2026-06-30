import { useTreatmentCourseDetail } from '../hooks/useTreatmentCourses'
import type { TreatmentCourseItemDto } from '../types/treatmentCourse.types'
import { Pencil } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { StatusBadge, type StatusMap } from '@/shared/components/StatusBadge'
import type { TreatmentCourseDto } from '../types/treatmentCourse.types'

interface Props {
  courseId: number
  onEdit: (course: TreatmentCourseDto) => void
}

const ITEM_STATUS_MAP: StatusMap = {
  '0': { label: 'Ngưng', variant: 'error' },
  '1': { label: 'Hoạt động', variant: 'success', dot: true },
}

export function TreatmentCourseDetailExpanded({ courseId, onEdit }: Props) {
  const { data, isLoading } = useTreatmentCourseDetail(courseId)
  const course = data?.data

  if (isLoading) {
    return (
      <div className="p-4 text-[13px] text-lotus-stone animate-pulse">Đang tải chi tiết...</div>
    )
  }

  if (!course) {
    return <div className="p-4 text-[13px] text-red-400">Không tải được chi tiết.</div>
  }

  const items = course.items ?? []

  return (
    <div className="px-6 py-4 bg-lotus-cream/30 border-t border-stone-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-semibold text-lotus-deep">{course.name}</span>
          <span className="text-[11px] text-lotus-stone">•</span>
          <span className="text-[12px] text-lotus-stone">{items.length} buổi</span>
          <span className="text-[11px] text-lotus-stone">•</span>
          <span className="text-[12px] text-lotus-stone">
            Giá bán: <strong className="text-lotus-deep">{(course.sellingPrice ?? 0).toLocaleString('vi-VN')}đ</strong>
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={() => onEdit(course)} className="text-[12px] gap-1.5">
          <Pencil className="w-3.5 h-3.5" /> Chỉnh sửa
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-[13px] text-lotus-stone">Chưa có buổi nào.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="text-left py-2 pr-4 text-lotus-stone font-semibold w-16">Buổi</th>
                <th className="text-left py-2 pr-4 text-lotus-stone font-semibold">Dịch vụ</th>
                <th className="text-left py-2 pr-4 text-lotus-stone font-semibold w-20">Số lần</th>
                <th className="text-left py-2 pr-4 text-lotus-stone font-semibold">Ghi chú</th>
                <th className="text-left py-2 text-lotus-stone font-semibold w-24">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: TreatmentCourseItemDto) => (
                <tr key={item.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50">
                  <td className="py-2 pr-4 font-semibold text-lotus-deep">#{item.sessionNumber}</td>
                  <td className="py-2 pr-4 text-lotus-deep">{item.serviceName ?? '—'}</td>
                  <td className="py-2 pr-4 text-lotus-stone">{item.quantity ?? 1}</td>
                  <td className="py-2 pr-4 text-lotus-stone">{item.note ?? '—'}</td>
                  <td className="py-2">
                    <StatusBadge status={String(item.status ?? 1)} statusMap={ITEM_STATUS_MAP} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {course.description && (
        <p className="mt-3 text-[12px] text-lotus-stone italic">{course.description}</p>
      )}
    </div>
  )
}
