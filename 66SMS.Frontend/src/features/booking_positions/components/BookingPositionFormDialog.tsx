import { useForm, type Resolver } from "react-hook-form";
import {
  useCreateBookingPosition,
  useUpdateBookingPosition,
} from "../hooks/useBookingPositions";
import { useBookingRooms } from "@/features/booking_rooms/hooks/useBookingRooms";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { BookingPositionDTO } from "../types/booking_position.types";
import type { BookingRoomDTO } from "@/features/booking_rooms/types/booking_room.types";
import {
  createBookingPositionSchema,
  updateBookingPositionFormSchema,
  type CreateBookingPositionPayload,
  type BookingPositionFormValues,
  type UpdateBookingPositionPayload,
} from "../schemas/bookingPosition.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { MapPin } from "lucide-react";

import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { FormSection } from "@/shared/forms/FormSection";
import { Input } from "@/shared/forms/Input";
import { SearchableSelect } from "@/shared/forms/SearchableSelect";
import { Switch } from "@/shared/forms/Switch";
import { Textarea } from "@/shared/forms/Textarea";
import { COMMON_MSG } from "@/shared/constants/common.messages";

interface BookingPositionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingPosition?: BookingPositionDTO | null;
  defaultRoomId?: number | null;
}

export function BookingPositionFormDialog({
  open,
  onOpenChange,
  bookingPosition,
  defaultRoomId = null,
}: BookingPositionFormDialogProps) {
  const isEdit = !!bookingPosition;
  const createMutation = useCreateBookingPosition();
  const updateMutation = useUpdateBookingPosition();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const salonId = useAuthStore((s) => s.getEffectiveSalonId());
  const { data: roomData } = useBookingRooms({
    pageIndex: 1,
    pageSize: 1000,
    salonId: salonId ?? undefined,
  });
  const rooms = roomData?.data?.items || [];

  const roomOptions = useMemo(
    () =>
      rooms
        .filter((r: BookingRoomDTO) => r.id != null)
        .map((r: BookingRoomDTO) => ({
          value: String(r.id),
          label: r.name ?? `Phòng #${r.id}`,
        })),
    [rooms],
  );

  const form = useForm<BookingPositionFormValues>({
    resolver: zodResolver(
      isEdit ? updateBookingPositionFormSchema : createBookingPositionSchema,
    ) as Resolver<BookingPositionFormValues>,
    defaultValues: getDefaultValues(bookingPosition, defaultRoomId),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = form;

  const selectedRoomId = watch("roomId");

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(bookingPosition, defaultRoomId));
    }
  }, [open, bookingPosition, defaultRoomId, reset]);

  const onSubmit = (data: BookingPositionFormValues) => {
    if (isEdit && bookingPosition?.id) {
      updateMutation.mutate(
        {
          id: bookingPosition.id,
          payload: data as UpdateBookingPositionPayload,
        },
        {
          onSuccess: (result) => {
            if (result.isSuccess) onOpenChange(false);
          },
        },
      );
    } else {
      createMutation.mutate(data as CreateBookingPositionPayload, {
        onSuccess: (result) => {
          if (result.isSuccess) onOpenChange(false);
        },
      });
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? "Chỉnh sửa vị trí dịch vụ" : "Thêm vị trí dịch vụ mới"}
      size="lg"
      scrollable
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormSection icon={MapPin} title="Thông tin vị trí dịch vụ">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <FormField
              label="Phòng dịch vụ"
              tooltip="Chọn phòng mà vị trí này thuộc về"
              error={errors.roomId?.message}
            >
              <SearchableSelect
                options={roomOptions}
                value={selectedRoomId ? String(selectedRoomId) : ""}
                onChange={(value: string) =>
                  setValue("roomId", Number(value), { shouldValidate: true })
                }
                placeholder="Chọn phòng..."
                searchPlaceholder="Tìm phòng..."
                emptyText="Không tìm thấy phòng"
                invalid={!!errors.roomId}
                clearable={false}
              />
            </FormField>

            <FormField
              label="Tên vị trí"
              tooltip="Vui lòng nhập vào tên vị trí dịch vụ"
              error={errors.name?.message}
            >
              <Input
                {...register("name")}
                placeholder="Giường 1"
                invalid={!!errors.name}
              />
            </FormField>

            <FormField
              label="Thứ tự hiển thị"
              tooltip="Số nhỏ sẽ được ưu tiên hiển thị trước"
              error={errors.sortOrder?.message}
            >
              <Input
                {...register("sortOrder", { valueAsNumber: true })}
                type="number"
                placeholder="0"
                invalid={!!errors.sortOrder}
              />
            </FormField>

            <FormField
              label="Trạng thái"
              tooltip="Bật để kích hoạt vị trí"
              error={errors.status?.message}
            >
              <div className="flex h-9 items-center">
                <Switch
                  checked={watch("status") === 1}
                  onChange={(checked: boolean) =>
                    setValue("status", checked ? 1 : 0)
                  }
                />
              </div>
            </FormField>

            <FormField
              label="Ghi chú"
              tooltip="Ghi chú không dài quá 500 ký tự"
              error={errors.note?.message}
              className="sm:col-span-2"
            >
              <Textarea
                {...register("note")}
                placeholder="Ghi chú ở đây"
                rows={3}
                invalid={!!errors.note}
              />
            </FormField>
          </div>
        </FormSection>

        <div className="flex justify-end gap-2 border-t border-kit pt-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mb-0"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {COMMON_MSG.cancel}
          </Button>
          <Button
            type="submit"
            variant="admin"
            size="sm"
            className="mb-0"
            loading={isPending}
          >
            {isEdit ? "Cập nhật" : "Tạo vị trí"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function getDefaultValues(
  bookingPosition?: BookingPositionDTO | null,
  defaultRoomId?: number | null,
): BookingPositionFormValues {
  if (bookingPosition) {
    return {
      roomId: bookingPosition.roomId ?? 0,
      name: bookingPosition.name ?? "",
      sortOrder: bookingPosition.sortOrder ?? 0,
      note: bookingPosition.note ?? "",
      status: bookingPosition.status ?? 1,
    };
  }
  return {
    roomId: defaultRoomId ?? 0,
    name: "",
    sortOrder: 0,
    note: "",
    status: 1,
  };
}
