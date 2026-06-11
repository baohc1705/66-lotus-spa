import { useForm, type Resolver } from "react-hook-form";
import {
  useCreateBookingPosition,
  useUpdateBookingPosition,
} from "../hooks/useBookingPositions";
import { useBookingRooms } from "@/features/booking_rooms/hooks/useBookingRooms";
import type { BookingPositionDTO } from "../types/booking_position.types";
import {
  createBookingPositionSchema,
  updateBookingPositionSchema,
  type CreateBookingPositionPayload,
  type BookingPositionFormValues,
  type UpdateBookingPositionPayload,
} from "../schemas/bookingPosition.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useRef } from "react";

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
import { MapPin, Check, ChevronDown, Search } from "lucide-react";
import { FormField } from "@/shared/components/forms/FormField";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import { cn } from "@/lib/utils";

interface BookingPositionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingPosition?: BookingPositionDTO | null;
}

export function BookingPositionFormDialog({
  open,
  onOpenChange,
  bookingPosition,
}: BookingPositionFormDialogProps) {
  const isEdit = !!bookingPosition;
  const createMutation = useCreateBookingPosition();
  const updateMutation = useUpdateBookingPosition();
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Fetch rooms for the dropdown
  const { data: roomData } = useBookingRooms({
    pageIndex: 1,
    pageSize: 1000,
  });
  const rooms = roomData?.data?.items || [];

  const form = useForm<BookingPositionFormValues>({
    resolver: zodResolver(
      isEdit ? updateBookingPositionSchema : createBookingPositionSchema,
    ) as Resolver<BookingPositionFormValues>,
    defaultValues: getDefaultValues(bookingPosition),
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

  // Custom Combobox State
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(bookingPosition));
      setSearchQuery("");
      setDropdownOpen(false);
    }
  }, [open, bookingPosition, reset]);

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

  const filteredRooms = rooms.filter((r) =>
    r.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Chỉnh sửa vị trí dịch vụ" : "Thêm vị trí dịch vụ mới"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Cập nhật thông tin vị trí ${bookingPosition?.name ?? ""}`
              : "Điền thông tin để tạo vị trí dịch vụ"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormSection icon={MapPin} title="Thông tin vị trí dịch vụ">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              
              <FormField
                label="Phòng dịch vụ"
                tooltip="Chọn phòng mà vị trí này thuộc về"
                error={errors.roomId?.message}
              >
                <div className="relative" ref={dropdownRef}>
                  <div
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-md bg-stone-100/80 px-3 py-2 text-[13px] text-lotus-deep outline-none cursor-pointer border border-transparent hover:bg-stone-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-lotus-leaf/30 transition-all",
                      dropdownOpen && "bg-white ring-2 ring-lotus-leaf/30"
                    )}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <span>{selectedRoom ? selectedRoom.name : <span className="text-lotus-stone">Chọn phòng...</span>}</span>
                    <ChevronDown className="w-4 h-4 text-lotus-stone" />
                  </div>

                  {dropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border border-stone-200 bg-white shadow-md overflow-hidden">
                      <div className="flex items-center px-3 py-2 border-b border-stone-100 text-lotus-deep">
                        <Search className="w-4 h-4 mr-2 text-lotus-stone" />
                        <input
                          autoFocus
                          className="w-full bg-transparent outline-none text-[13px] placeholder:text-lotus-stone"
                          placeholder="Tìm phòng..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto p-1">
                        {filteredRooms.length === 0 ? (
                          <div className="px-3 py-2 text-[13px] text-lotus-stone text-center">Không tìm thấy phòng</div>
                        ) : (
                          filteredRooms.map((room) => (
                            <div
                              key={room.id}
                              className={cn(
                                "flex items-center justify-between px-3 py-2 text-[13px] rounded-sm cursor-pointer hover:bg-lotus-cream/50",
                                selectedRoomId === room.id ? "bg-lotus-cream/30 text-lotus-leaf font-medium" : "text-lotus-deep"
                              )}
                              onClick={() => {
                                setValue("roomId", room.id as number, { shouldValidate: true });
                                setDropdownOpen(false);
                                setSearchQuery("");
                              }}
                            >
                              <span>{room.name}</span>
                              {selectedRoomId === room.id && <Check className="w-4 h-4" />}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </FormField>

              <FormField
                label="Tên vị trí"
                tooltip="Vui lòng nhập vào tên vị trí dịch vụ"
                error={errors.name?.message}
              >
                <Input
                  {...register("name")}
                  placeholder="Giường 1"
                  className="h-9 text-[13px]"
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
                  className="h-9 text-[13px]"
                />
              </FormField>

              <FormField
                label="Trạng thái"
                tooltip="Bật để kích hoạt vị trí"
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
              {isEdit ? "Cập nhật" : "Tạo vị trí"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getDefaultValues(
  bookingPosition?: BookingPositionDTO | null,
): BookingPositionFormValues {
  if (bookingPosition) {
    return {
      roomId: bookingPosition.roomId ?? 0,
      name: bookingPosition.name ?? "",
      sortOrder: bookingPosition.sortOrder ?? 0,
      note: bookingPosition.note ?? "",
      status: bookingPosition.status ?? 0,
    };
  }
  return {
    roomId: 0,
    name: "",
    sortOrder: 0,
    note: "",
    status: 0,
  };
}
