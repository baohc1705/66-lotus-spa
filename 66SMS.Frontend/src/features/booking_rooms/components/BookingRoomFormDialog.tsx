import { AdminTextarea } from "@/shared/components/forms/AdminTextarea";
import { AdminInput } from "@/shared/components/forms/AdminInput";
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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { FormSection } from "@/shared/components/forms/FormSection";
import { DoorOpen } from "lucide-react";
import { FormField } from "@/shared/components/forms/FormField";
import { Switch } from "@/shared/components/ui/switch";
import { ImageUpload } from "@/shared/components/ImageUpload";
import { fileToBase64 } from "@/shared/lib/fileToBase64";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/components/ui/select";
import { AdminSelectTrigger } from "@/shared/components/forms/AdminSelectTrigger";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Chỉnh sửa phòng dịch vụ" : "Thêm phòng dịch vụ mới"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Cập nhật thông tin phòng dịch vụ ${bookingRoom?.name ?? ""}`
              : "Điền thông tin để tạo phòng dịch vụ"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormSection icon={DoorOpen} title="Thông tin phòng dịch vụ">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {!isEdit && (
                <FormField
                  label="Chi nhánh *"
                  tooltip="Phòng thuộc chi nhánh nào"
                  error={errors.salonId?.message}
                >
                  <Select
                    value={watch("salonId")?.toString() ?? ""}
                    onValueChange={(v) =>
                      setValue("salonId", Number(v), { shouldValidate: true })
                    }
                  >
                    <AdminSelectTrigger>
                      <SelectValue
                        placeholder={
                          salonsResult === undefined
                            ? "Đang tải chi nhánh..."
                            : salons.length === 0
                              ? "Không có chi nhánh"
                              : "Chọn chi nhánh..."
                        }
                      />
                    </AdminSelectTrigger>
                    <SelectContent>
                      {salons.map((s: SalonDTO) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}

              <FormField
                label="Tên phòng"
                tooltip="Vui lòng nhập vào tên phòng dịch vụ"
                error={errors.name?.message}
              >
                <AdminInput {...register("name")} placeholder="Phòng VIP 1" />
              </FormField>

              <FormField
                label="Trạng thái"
                tooltip="Bật để kích hoạt phòng"
                error={errors.status?.message}
              >
                <div className="flex items-center h-9">
                  <Switch
                    checked={watch("status") === 1}
                    onCheckedChange={(checked) =>
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

              <div className="sm:col-span-2">
                <FormField
                  label="Ghi chú"
                  tooltip="Ghi chú không dài quá 500 ký tự"
                  error={errors.note?.message}
                >
                  <AdminTextarea
                    {...register("note")}
                    placeholder="Ghi chú ở đây"
                    className=""
                  />
                </FormField>
              </div>
            </div>
          </FormSection>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {COMMON_MSG.cancel}
            </Button>
            <Button
              type="submit"
              variant="admin"
              size="sm"
              loading={isPending || isUploading}
            >
              {isEdit ? "Cập nhật" : "Tạo phòng"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
