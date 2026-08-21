import { useBookingRooms } from "@/features/booking_rooms/hooks/useBookingRooms";
import {
  useCreateBookingPosition,
  useUpdateBookingPosition,
} from "@/features/booking_positions/hooks/useBookingPositions";
import type {
  BookingPositionDto,
  CreateBookingPositionRequest,
  UpdateBookingPositionRequest,
} from "@/features/booking_positions/types/bookingPosition.types";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { Modal } from "@/shared/components/Modal";
import { Tabs } from "@/shared/components/Tabs";
import { StatusActive } from "@/shared/constants/status.enum";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { FormRow } from "@/shared/forms/FormRow";
import { FormSection } from "@/shared/forms/FormSection";
import { Input } from "@/shared/forms/Input";
import { SearchableSelect } from "@/shared/forms/SearchableSelect";
import { Switch } from "@/shared/forms/Switch";
import { Textarea } from "@/shared/forms/Textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { z } from "zod";

// Validate dữ liệu client side
const bookingPositionSchema = z.object({
  roomId: z.coerce.number().min(1, "Vui lòng chọn phòng dịch vụ"),
  name: z
    .string()
    .nonempty("Tên vị trí không được để trống")
    .max(100, "Tối đa 100 ký tự"),
  sortOrder: z.coerce.number().min(0, "Phải lớn hơn hoặc bằng 0").optional(),
  note: z
    .string()
    .max(500, "Tối đa 500 ký tự")
    .optional()
    .or(z.literal("")),
  status: z.coerce.number().optional(),
});

type BookingPositionFormData = z.infer<typeof bookingPositionSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingPosition?: BookingPositionDto | null;
  defaultRoomId?: number | null;
}

// Hàm getDefaultValues để lấy giá trị mặc định cho form
function getDefaultValues(
  bookingPosition?: BookingPositionDto | null,
  defaultRoomId?: number | null,
): BookingPositionFormData {
  if (bookingPosition) {
    return {
      roomId: bookingPosition.roomId ?? 0,
      name: bookingPosition.name ?? "",
      sortOrder: bookingPosition.sortOrder ?? 0,
      note: bookingPosition.note ?? "",
      status: bookingPosition.status ?? StatusActive.Active,
    };
  }
  return {
    roomId: defaultRoomId ?? 0,
    name: "",
    sortOrder: 0,
    note: "",
    status: StatusActive.Active,
  };
}

export function BookingPositionForm({
  open,
  onOpenChange,
  bookingPosition,
  defaultRoomId = null,
}: Props) {
  const isEdit = !!bookingPosition;
  const createMutation = useCreateBookingPosition();
  const updateMutation = useUpdateBookingPosition();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const [activeTab, setActiveTab] = useState("info");

  const salonId = useAuthStore((state) => state.getEffectiveSalonId());
  const { data: roomData } = useBookingRooms(
    {
      pageIndex: 1,
      pageSize: 1000,
      salonId: salonId ?? undefined,
    },
    open,
  );
  const rooms = roomData?.data?.items ?? [];

  const roomOptions: { value: string; label: string }[] = [];
  for (let index = 0; index < rooms.length; index++) {
    const room = rooms[index];
    if (room.id == null) continue;
    roomOptions.push({
      value: String(room.id),
      label: room.name ?? `Phòng #${room.id}`,
    });
  }

  const formKey = !open
    ? "closed"
    : isEdit
      ? `edit-${bookingPosition?.id ?? "new"}`
      : "new";
  const [appliedFormKey, setAppliedFormKey] = useState(formKey);
  if (formKey !== appliedFormKey) {
    setAppliedFormKey(formKey);
    if (open === true) {
      setActiveTab("info");
    }
  }

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm<BookingPositionFormData>({
    resolver: zodResolver(
      bookingPositionSchema,
    ) as Resolver<BookingPositionFormData>,
    defaultValues: getDefaultValues(bookingPosition, defaultRoomId),
  });

  const selectedRoomId = useWatch({ control, name: "roomId" });
  const status = useWatch({ control, name: "status" });

  useEffect(() => {
    if (!open) return;
    reset(getDefaultValues(bookingPosition, defaultRoomId));
  }, [open, bookingPosition, defaultRoomId, reset]);

  function onSubmit(values: BookingPositionFormData) {
    if (isEdit && bookingPosition?.id) {
      const data: UpdateBookingPositionRequest = {
        roomId: values.roomId,
        name: values.name,
        sortOrder: values.sortOrder,
        note: values.note || undefined,
        status: values.status,
      };

      updateMutation.mutate(
        { id: bookingPosition.id, data },
        {
          onSuccess: (result) => {
            if (result.isSuccess !== true) return;
            onOpenChange(false);
          },
        },
      );
      return;
    }

    const payload: CreateBookingPositionRequest = {
      roomId: values.roomId,
      name: values.name,
      sortOrder: values.sortOrder,
      note: values.note || undefined,
      status: values.status,
    };

    createMutation.mutate(payload, {
      onSuccess: (result) => {
        if (result.isSuccess !== true) return;
        onOpenChange(false);
      },
    });
  }

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? "Chỉnh sửa vị trí dịch vụ" : "Thêm vị trí dịch vụ mới"}
      size="xl"
      scrollable
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mb-0"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form="booking-position-form"
            variant="admin"
            size="sm"
            className="mb-0"
            loading={isPending}
          >
            {isEdit ? "Cập nhật" : "Tạo vị trí"}
          </Button>
        </>
      }
    >
      <form
        id="booking-position-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <Tabs
          variant="body"
          activeId={activeTab}
          onChange={setActiveTab}
          tabs={[
            {
              id: "info",
              label: "Thông tin",
              content: (
                <FormSection title="Thông tin vị trí dịch vụ">
                  <FormRow>
                    <FormField
                      label="Phòng dịch vụ"
                      required
                      tooltip="Chọn phòng mà vị trí này thuộc về"
                      error={errors.roomId?.message}
                    >
                      <SearchableSelect
                        options={roomOptions}
                        value={selectedRoomId ? String(selectedRoomId) : ""}
                        onChange={(value: string) =>
                          setValue("roomId", Number(value), {
                            shouldValidate: true,
                          })
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
                      required
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
                          checked={status === StatusActive.Active}
                          onChange={(checked: boolean) =>
                            setValue(
                              "status",
                              checked
                                ? StatusActive.Active
                                : StatusActive.Inactive,
                            )
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
                  </FormRow>
                </FormSection>
              ),
            },
          ]}
        />
      </form>
    </Modal>
  );
}
