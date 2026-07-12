import { formatCurrency } from "@/shared/utils/currency";
import { useTreatmentCourseDetail } from "../hooks/useTreatmentCourses";
import type { TreatmentCourseItemDto } from "../types/treatmentCourse.types";
import { Pencil } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { StatusBadge, type StatusMap } from "@/shared/components/StatusBadge";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { TREATMENT_COURSE_PERM } from "../constants/treatmentCourse.permissions";
import type { TreatmentCourseDto } from "../types/treatmentCourse.types";

interface Props {
  courseId: number;
  onEdit: (course: TreatmentCourseDto) => void;
}

const ITEM_STATUS_MAP: StatusMap = {
  "0": { label: "Ngưng", variant: "error" },
  "1": { label: "Hoạt động", variant: "success", dot: true },
};

export function TreatmentCourseDetailExpanded({ courseId, onEdit }: Props) {
  const { data, isLoading } = useTreatmentCourseDetail(courseId);
  const course = data?.data;
  const perm = TREATMENT_COURSE_PERM;

  if (isLoading) {
    return (
      <div className="p-4 text-sm text-adminGray-600 animate-pulse">
        Đang tải chi tiết...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-4 text-sm text-state-danger-text">
        Không tải được chi tiết.
      </div>
    );
  }

  const items = course.items ?? [];

  return (
    <div className="px-6 py-4 bg-adminGray-50/30 border-t border-adminGray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-adminInk">
            {course.name}
          </span>
          <span className="text-xs text-adminGray-600">•</span>
          <span className="text-xs text-adminGray-600">
            {items.length} buổi
          </span>
          <span className="text-xs text-adminGray-600">•</span>
          <span className="text-xs text-adminGray-600">
            Giá bán:{" "}
            <strong className="text-adminInk">
              {formatCurrency(course.sellingPrice)}
            </strong>
          </span>
        </div>
        <PermissionGate resource={perm.resource} action={perm.update}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(course)}
            className="text-xs gap-1.5"
          >
            <Pencil className="w-3.5 h-3.5" /> Chỉnh sửa
          </Button>
        </PermissionGate>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-adminGray-600">Chưa có buổi nào.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-adminGray-100">
                <th className="text-left py-2 pr-4 text-adminGray-600 font-semibold w-16">
                  Buổi
                </th>
                <th className="text-left py-2 pr-4 text-adminGray-600 font-semibold">
                  Dịch vụ
                </th>
                <th className="text-left py-2 pr-4 text-adminGray-600 font-semibold w-20">
                  Số lần
                </th>
                <th className="text-left py-2 pr-4 text-adminGray-600 font-semibold">
                  Ghi chú
                </th>
                <th className="text-left py-2 text-adminGray-600 font-semibold w-24">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: TreatmentCourseItemDto) => (
                <tr
                  key={item.id}
                  className="border-b border-adminGray-100 last:border-0 hover:bg-adminGray-50/50"
                >
                  <td className="py-2 pr-4 font-semibold text-adminInk">
                    #{item.sessionNumber}
                  </td>
                  <td className="py-2 pr-4 text-adminInk">
                    {item.serviceName ?? "—"}
                  </td>
                  <td className="py-2 pr-4 text-adminGray-600">
                    {item.quantity ?? 1}
                  </td>
                  <td className="py-2 pr-4 text-adminGray-600">
                    {item.note ?? "—"}
                  </td>
                  <td className="py-2">
                    <StatusBadge
                      status={String(item.status ?? 1)}
                      statusMap={ITEM_STATUS_MAP}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {course.description && (
        <p className="mt-3 text-xs text-adminGray-600 italic">
          {course.description}
        </p>
      )}
    </div>
  );
}
