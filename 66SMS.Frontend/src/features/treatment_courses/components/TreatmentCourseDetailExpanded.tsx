import { formatCurrency } from "@/shared/utils/currency";
import { useTreatmentCourseDetail } from "../hooks/useTreatmentCourses";
import type { TreatmentCourseItemDto } from "../types/treatmentCourse.types";
import { Pencil } from "lucide-react";
import { Button } from "@/shared/elements/Button";
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
      <div className="animate-pulse p-4 text-sm text-kit-muted">
        Đang tải chi tiết...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-4 text-sm text-kit-danger">Không tải được chi tiết.</div>
    );
  }

  const items = course.items ?? [];

  function renderItemRows() {
    const rows = [];
    for (let index = 0; index < items.length; index++) {
      const item: TreatmentCourseItemDto = items[index];
      rows.push(
        <tr
          key={item.id}
          className="border-b border-kit last:border-0 hover:bg-kit-page/50"
        >
          <td className="py-2 pr-4 font-semibold text-kit-heading">
            #{item.sessionNumber}
          </td>
          <td className="py-2 pr-4 text-kit-heading">
            {item.serviceName ?? "—"}
          </td>
          <td className="py-2 pr-4 text-kit-muted">{item.quantity ?? 1}</td>
          <td className="py-2 pr-4 text-kit-muted">{item.note ?? "—"}</td>
          <td className="py-2">
            <StatusBadge
              status={String(item.status ?? 1)}
              statusMap={ITEM_STATUS_MAP}
            />
          </td>
        </tr>,
      );
    }
    return rows;
  }

  return (
    <div className="border-t border-kit bg-kit-page/30 px-6 py-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-kit-heading">
            {course.name}
          </span>
          <span className="text-xs text-kit-muted">•</span>
          <span className="text-xs text-kit-muted">{items.length} buổi</span>
          <span className="text-xs text-kit-muted">•</span>
          <span className="text-xs text-kit-muted">
            Giá bán:{" "}
            <strong className="text-kit-heading">
              {formatCurrency(course.sellingPrice)}
            </strong>
          </span>
        </div>
        <PermissionGate resource={perm.resource} action={perm.update}>
          <Button
            variant="outline-primary"
            size="sm"
            className="mb-0"
            onClick={() => onEdit(course)}
          >
            <Pencil className="h-3.5 w-3.5" /> Chỉnh sửa
          </Button>
        </PermissionGate>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-kit-muted">Chưa có buổi nào.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-kit">
                <th className="w-16 py-2 pr-4 text-left font-semibold text-kit-muted">
                  Buổi
                </th>
                <th className="py-2 pr-4 text-left font-semibold text-kit-muted">
                  Dịch vụ
                </th>
                <th className="w-20 py-2 pr-4 text-left font-semibold text-kit-muted">
                  Số lần
                </th>
                <th className="py-2 pr-4 text-left font-semibold text-kit-muted">
                  Ghi chú
                </th>
                <th className="w-24 py-2 text-left font-semibold text-kit-muted">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody>{renderItemRows()}</tbody>
          </table>
        </div>
      )}

      {course.description ? (
        <p className="mt-3 text-xs italic text-kit-muted">
          {course.description}
        </p>
      ) : null}
    </div>
  );
}
