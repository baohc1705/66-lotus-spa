import { useForm, type Resolver } from "react-hook-form";
import {
  useCreateBookingRoom,
  useUpdateBookingRoom,
} from "../hooks/useBookingRooms";
import type { BookingRoomDTO } from "../types/booking_room.types";
import {
  createBookingRoomSchema,
  updateBookingRoomSchema,
  type CreateBookingRoomPayload,
  type BookingRoomFormValues,
  type UpdateBookingRoomPayload,
} from "../schemas/bookingRoom.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

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
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";

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

  const form = useForm<BookingRoomFormValues>({
    resolver: zodResolver(
      isEdit ? updateBookingRoomSchema : createBookingRoomSchema,
    ) as Resolver<BookingRoomFormValues>,
    defaultValues: getDefaultValues(bookingRoom),
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
      reset(getDefaultValues(bookingRoom));
    }
  }, [open, bookingRoom, reset]);

  const onSubmit = (data: BookingRoomFormValues) => {
    if (isEdit && bookingRoom?.id) {
      updateMutation.mutate(
        {
          id: bookingRoom.id,
          payload: data as UpdateBookingRoomPayload,
        },
        {
          onSuccess: (result) => {
            if (result.isSuccess) onOpenChange(false);
          },
        },
      );
    } else {
      createMutation.mutate(data as CreateBookingRoomPayload, {
        onSuccess: (result) => {
          if (result.isSuccess) onOpenChange(false);
        },
      });
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <FormField
                label="Tên phòng"
                tooltip="Vui lòng nhập vào tên phòng dịch vụ"
                error={errors.name?.message}
              >
                <Input
                  {...register("name")}
                  placeholder="Phòng VIP 1"
                  className="h-9 text-[13px]"
                />
              </FormField>

              <FormField
                label="Trạng thái"
                tooltip="Bật để kích hoạt phòng"
                error={errors.status?.message}
              >
                <div className="flex items-center h-9">
                  <Switch
                    checked={watch("status") === 1}
                    onCheckedChange={(checked) => setValue("status", checked ? 1 : 0)}
                  />
                </div>
              </FormField>
              
              <div className="sm:col-span-2">
                <FormField
                  label="URL Hình ảnh"
                  tooltip="Đường dẫn đến hình ảnh của phòng (nếu có)"
                  error={errors.imageUrl?.message}
                >
                  <Input
                    {...register("imageUrl")}
                    placeholder="https://example.com/image.jpg"
                    className="h-9 text-[13px]"
                  />
                </FormField>
              </div>

              <div className="sm:col-span-2">
                <FormField
                  label="Ghi chú"
                  tooltip="Ghi chú không dài quá 500 ký tự"
                  error={errors.note?.message}
                >
                  <Textarea
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
              Hủy
            </Button>
            <Button type="submit" variant="admin" size="sm" loading={isPending}>
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
): BookingRoomFormValues {
  if (bookingRoom) {
    return {
      name: bookingRoom.name ?? "",
      imageUrl: bookingRoom.imageUrl ?? "",
      note: bookingRoom.note ?? "",
      status: bookingRoom.status ?? 0,
    };
  }
  return {
    name: "",
    imageUrl: "",
    note: "",
    status: 0,
  };
}
