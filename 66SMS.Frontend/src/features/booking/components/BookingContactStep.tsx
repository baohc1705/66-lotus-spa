import React, { useState } from "react";
import { Phone, Info, ArrowLeft, Loader2, Wallet } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useBookingStore } from "../stores/bookingStore";
import { useCreateBooking } from "../hooks/useBookingData";
import {
  bookingContactSchema,
  type BookingContactFormValues,
} from "../schemas/booking.schema";
import type { GuestAppointmentDto } from "../types/booking.types";

export const BookingContactStep: React.FC = () => {
  const {
    guests,
    contactInfo,
    setContactInfo,
    prevStep,
    nextStep,
    selectedSalon,
    promotionCode,
    appliedPromotion,
  } = useBookingStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutateAsync: createBooking } = useCreateBooking();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<BookingContactFormValues>({
    resolver: zodResolver(bookingContactSchema),
    defaultValues: contactInfo || {
      fullName: "",
      phoneNumber: "",
      email: "",
      note: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: BookingContactFormValues) => {
    const invalidGuests = guests.filter(
      (g) => !g.selectedService || !g.selectedDate || !g.selectedTimeSlot
    );

    if (invalidGuests.length > 0) {
      toast.error(
        "Vui lòng chọn đầy đủ Dịch vụ và Thời gian cho tất cả khách hàng."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setContactInfo(data);

      const payload: GuestAppointmentDto[] = guests.map((guest, index) => {
        const isFirstGuest = index === 0;
        const notePrefix = `[Đại diện: ${data.fullName} - SĐT: ${data.phoneNumber}]`;
        const finalNote =
          isFirstGuest && data.note
            ? `${notePrefix} - Ghi chú: ${data.note}`
            : notePrefix;

        return {
          lockId: guest.lockId,
          staffId: guest.selectedTechnician?.id ?? null,
          slotId: guest.selectedTimeSlot!.slotId || 0,
          appointmentDate: guest.selectedDate!.toISOString().split("T")[0],
          positionId: guest.selectedPosition?.id || 0,
          salonId: selectedSalon?.id ?? null,
          note: finalNote,
          services: [
            { serviceId: guest.selectedService!.id ?? 0, quantity: 1 },
          ],
        };
      });

      const result = await createBooking({
        promotionCode: appliedPromotion ? promotionCode : undefined,
        guests: payload,
      });

      if (result.success) {
        toast.success("Đặt lịch thành công! Cảm ơn bạn đã tin tưởng.");
        nextStep();
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = guests.reduce(
    (sum, g) => sum + (g.selectedService?.sellingPrice || 0),
    0
  );
  const discount = appliedPromotion ? appliedPromotion.discountAmount : 0;
  const depositPreview = Math.round(Math.max(0, total - discount) * 0.3);

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 rounded-sm shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-lotus-rose-light bg-lotus-cream/50 transition-colors ${
      hasError ? "ring-2 ring-red-400" : ""
    }`;

  return (
    <div className="bg-white rounded-sm shadow-sm p-4 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-lg font-bold text-lotus-deep font-display flex items-center gap-2">
        <Phone className="w-5 h-5 text-lotus-rose" />
        <span>Thông tin liên hệ</span>
      </h3>

      <div className="p-4 rounded-sm shadow-sm bg-blue-50 flex gap-3">
        <Wallet className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-gray-700">
          <p className="font-semibold text-gray-900">Đặt cọc 30% để giữ lịch</p>
          <p className="mt-1 text-gray-600">
            Sau khi xác nhận, bạn sẽ cần thanh toán cọc{" "}
            <strong>{depositPreview.toLocaleString("vi-VN")}đ</strong> cho tổng
            cộng {guests.length} khách. Phần còn lại thu sau khi sử dụng dịch vụ
            tại spa.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col relative">
            <label className="text-xs font-bold text-lotus-deep mb-2 flex items-center gap-1.5">
              Họ và tên người đặt *
              <span className="group relative cursor-pointer text-gray-400 hover:text-gray-600">
                <Info className="w-3.5 h-3.5" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-gray-800 text-white text-[10px] py-1 px-2.5 rounded-sm whitespace-nowrap z-50">
                  Người đại diện đặt lịch
                </span>
              </span>
            </label>
            <input
              {...register("fullName")}
              type="text"
              placeholder="Nhập họ và tên..."
              className={inputClass(!!errors.fullName)}
            />
            {errors.fullName && (
              <span className="text-xs text-red-500 mt-1">
                {errors.fullName.message}
              </span>
            )}
          </div>

          <div className="flex flex-col relative">
            <label className="text-xs font-bold text-lotus-deep mb-2 flex items-center gap-1.5">
              Số điện thoại người đặt *
              <span className="group relative cursor-pointer text-gray-400 hover:text-gray-600">
                <Info className="w-3.5 h-3.5" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-gray-800 text-white text-[10px] py-1 px-2.5 rounded-sm whitespace-nowrap z-50">
                  Để hệ thống gửi SMS xác nhận lập tức
                </span>
              </span>
            </label>
            <input
              {...register("phoneNumber")}
              type="tel"
              placeholder="Ví dụ: 0901234567"
              className={inputClass(!!errors.phoneNumber)}
            />
            {errors.phoneNumber && (
              <span className="text-xs text-red-500 mt-1">
                {errors.phoneNumber.message}
              </span>
            )}
          </div>

          <div className="col-span-full flex flex-col relative">
            <label className="text-xs font-bold text-lotus-deep mb-2">
              Email (Tùy chọn)
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="example@gmail.com"
              className={inputClass(!!errors.email)}
            />
            {errors.email && (
              <span className="text-xs text-red-500 mt-1">
                {errors.email.message}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-lotus-deep mb-2">
            Ghi chú yêu cầu chung (Nếu có)
          </label>
          <textarea
            {...register("note")}
            rows={3}
            placeholder="Yêu cầu chung cho đoàn khách..."
            className="w-full px-4 py-3 rounded-sm shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-lotus-rose-light bg-lotus-cream/50 resize-none"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
          <button
            type="button"
            onClick={prevStep}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-full font-bold transition-all bg-lotus-cream text-lotus-deep shadow-sm hover:shadow-md disabled:opacity-50"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 rounded-full font-bold transition-all bg-lotus-rose text-white hover:bg-lotus-rose/90 shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Đang xử lý...
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                Xác nhận & Đặt cọc
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
