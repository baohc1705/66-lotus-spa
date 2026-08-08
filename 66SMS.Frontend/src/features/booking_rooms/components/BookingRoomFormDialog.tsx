import { useForm, type Resolver } from "react-hook-form";
import {
  useCreateBookingRoom,
  useUpdateBookingRoom,
} from "../hooks/useBookingRooms";
import { useAdminSalons } from "@/features/salons/hooks/useSalons";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { BookingRoomDTO } from "../types/booking_room.types";
import type { SalonDTO } from "@/features/salons/types/salon.types";
import {
  createBookingRoomSchema,
  updateBookingRoomFormSchema,
  type CreateBookingRoomPayload,
  type BookingRoomFormValues,
  type UpdateBookingRoomPayload,
} from "../schemas/bookingRoom.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { DoorOpen } from "lucide-react";

import { Modal } from "@/shared/components/Modal";
import { ImageUpload } from "@/shared/components/ImageUpload";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { FormSection } from "@/shared/forms/FormSection";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
import { Switch } from "@/shared/forms/Switch";
import { Textarea } from "@/shared/forms/Textarea";
import { fileToBase64 } from "@/shared/lib/fileToBase64";
import { COMMON_MSG } from "@/shared/constants/common.messages";

interface BookingRoomFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingRoom?: BookingRoomDTO | null;
}

export function BookingRoomFormDialog({
  open,
  onOpenChange,
  bookingRoom,
}: BookingRoomFormDialogProps) {
  const isEdit = !!bookingRoom;
  const createMutation = useCreateBookingRoom();
  const updateMutation = useUpdateBookingRoom();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const effectiveSalonId = useAuthStore((s) => s.getEffectiveSalonId());
  const { data: salonsResult } = useAdminSalons(
    { pageIndex: 1, pageSize: 100 },
    open && !isEdit,
  );
  const salons = salonsResult?.data?.items ?? [];

  const form = useForm<BookingRoomFormValues>({
    resolver: zodResolver(
      isEdit ? updateBookingRoomFormSchema : createBookingRoomSchema,
    ) as Resolver<BookingRoomFormValues>,
    defaultValues: getDefaultValues(bookingRoom, effectiveSalonId),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = form;

  useEffect(() => {
    if (open) {
      setPendingFile(null);
      reset(getDefaultValues(bookingRoom, effectiveSalonId));
    }
  }, [open, bookingRoom, effectiveSalonId, reset]);

  const onSubmit = async (data: BookingRoomFormValues) => {
    setIsUploading(true);
    try {
      let imageUrl: string | undefined;
      if (pendingFile) {
        imageUrl = await fileToBase64(pendingFile);
      }

      if (isEdit && bookingRoom?.id) {
        const payload: UpdateBookingRoomPayload = {
          name: data.name,
          note: data.note || undefined,
          status: data.status,
          ...(imageUrl ? { imageUrl } : {}),
        };
        updateMutation.mutate(
          { id: bookingRoom.id, payload },
          {
            onSuccess: (result) => {
              if (result.isSuccess) onOpenChange(false);
            },
          },
        );
      } else {
        const payload: CreateBookingRoomPayload = {
          salonId: data.salonId!,
          name: data.name,
          imageUrl,
          note: data.note || undefined,
          status: data.status,
        };
        createMutation.mutate(payload, {
          onSuccess: (result) => {
            if (result.isSuccess) onOpenChange(false);
          },
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const salonPlaceholder =
    salonsResult === undefined
      ? "Đang tải chi nhánh..."
      : salons.length === 0
        ? "Không có chi nhánh"
        : "Chọn chi nhánh...";

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? "Chỉnh sửa phòng dịch vụ" : "Thêm phòng dịch vụ mới"}
      size="lg"
      scrollable
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormSection icon={DoorOpen} title="Thông tin phòng dịch vụ">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {!isEdit && (
              <FormField
                label="Chi nhánh *"
                tooltip="Phòng thuộc chi nhánh nào"
                error={errors.salonId?.message}
              >
                <Select
                  value={watch("salonId")?.toString() ?? ""}
                  onChange={(e) =>
                    setValue("salonId", Number(e.target.value), {
                      shouldValidate: true,
                    })
                  }
                  invalid={!!errors.salonId}
                >
                  <option value="">{salonPlaceholder}</option>
                  {salons.map((s: SalonDTO) => (
                    <option key={s.id} value={String(s.id)}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </FormField>
            )}

            <FormField
              label="Tên phòng"
              tooltip="Vui lòng nhập vào tên phòng dịch vụ"
              error={errors.name?.message}
            >
              <Input
                {...register("name")}
                placeholder="Phòng VIP 1"
                invalid={!!errors.name}
              />
            </FormField>

            <FormField
              label="Trạng thái"
              tooltip="Bật để kích hoạt phòng"
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

            <div className="sm:col-span-2">
              <ImageUpload
                value={watch("imageUrl")}
                onFileChange={setPendingFile}
                shape="square"
                label="Chọn ảnh phòng"
              />
            </div>

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
            loading={isPending || isUploading}
          >
            {isEdit ? "Cập nhật" : "Tạo phòng"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function getDefaultValues(
  bookingRoom?: BookingRoomDTO | null,
  effectiveSalonId?: number | null,
): BookingRoomFormValues {
  if (bookingRoom) {
    return {
      name: bookingRoom.name ?? "",
      imageUrl: bookingRoom.imageUrl ?? "",
      note: bookingRoom.note ?? "",
      status: bookingRoom.status ?? 1,
    };
  }
  return {
    salonId: effectiveSalonId ?? undefined,
    name: "",
    imageUrl: "",
    note: "",
    status: 1,
  };
}
