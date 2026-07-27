import React, { useState } from "react";
import { Phone, Info, ArrowLeft, Loader2, Wallet } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth/stores/authStore";
import {
  useMembershipTiers,
  useMyMembershipCard,
} from "@/features/profile/hooks/useMembershipInfo";
import { useBookingStore } from "../stores/bookingStore";
import { useCreateBooking } from "../hooks/useBookingData";
import {
  bookingContactSchema,
  type BookingContactFormValues,
} from "../schemas/booking.schema";
import type { GuestAppointmentDto } from "../types/booking.types";
import { formatDate } from "@/shared/utils/date.utils";

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

  const accessToken = useAuthStore((s) => s.accessToken);
  const membershipCardQuery = useMyMembershipCard(!!accessToken);
  const tiersQuery = useMembershipTiers();

  const membershipTier = tiersQuery.data?.find(
    (t) => t.id === membershipCardQuery.data?.membershipTierId,
  );
  const membershipPercent = membershipTier?.discountPercent ?? 0;

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
          appointmentDate: formatDate(guest.selectedDate!).format("YYYY-MM-DD"),
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

  const servicesSubTotal = guests.reduce(
    (sum, g) => sum + (g.selectedService?.sellingPrice || 0),
    0
  );
  const membershipDiscount =
    membershipPercent > 0 && servicesSubTotal > 0
      ? Math.round((servicesSubTotal * membershipPercent) / 100)
      : 0;
  const promoDiscount = appliedPromotion ? appliedPromotion.discountAmount : 0;
  const finalTotal = Math.max(0, servicesSubTotal - membershipDiscount - promoDiscount);
  const depositPreview = Math.round(finalTotal * 0.3);

  const inputClass = (hasError: boolean) =>
    `w-full rounded-sm border bg-surface px-4 py-3 text-sm text-ink transition-colors placeholder:text-warm-600 hover:border-warm-300 focus:outline-none focus:border-rose-600 ${
      hasError ? "border-error-text" : "border-warm-100"
    }`;

  return (
    <div className="lotus-panel flex flex-col gap-5 p-5 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
        <Phone className="h-5 w-5 text-rose-600" />
        <span>Thông tin liên hệ</span>
      </h3>

      <div className="p-4 rounded-sm border border-warning-bg bg-warning-bg flex gap-3">
        <Wallet className="w-5 h-5 text-warning-text shrink-0 mt-0.5" />
        <div className="text-sm text-ink">
          <p className="font-semibold text-ink">Đặt cọc 30% để giữ lịch</p>
          <p className="mt-1 text-warm-600">
            Sau khi xác nhận, bạn sẽ cần thanh toán cọc{" "}
            <strong className="text-rose-600">{depositPreview.toLocaleString("vi-VN")}đ</strong> cho tổng
            cộng {guests.length} khách. Phần còn lại thu sau khi sử dụng dịch vụ
            tại spa.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col relative">
            <label className="text-xs font-bold text-ink mb-2 flex items-center gap-1.5">
              Họ và tên người đặt *
              <span className="group relative cursor-pointer text-warm-400 hover:text-warm-600">
                <Info className="w-3.5 h-3.5" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-ink text-white text-2xs py-1 px-2.5 rounded-sm whitespace-nowrap z-50">
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
              <span className="text-xs text-error-text mt-1">
                {errors.fullName.message}
              </span>
            )}
          </div>

          <div className="flex flex-col relative">
            <label className="text-xs font-bold text-ink mb-2 flex items-center gap-1.5">
              Số điện thoại người đặt *
              <span className="group relative cursor-pointer text-warm-400 hover:text-warm-600">
                <Info className="w-3.5 h-3.5" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-ink text-white text-2xs py-1 px-2.5 rounded-sm whitespace-nowrap z-50">
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
              <span className="text-xs text-error-text mt-1">
                {errors.phoneNumber.message}
              </span>
            )}
          </div>

          <div className="col-span-full flex flex-col relative">
            <label className="text-xs font-bold text-ink mb-2">
              Email (Tùy chọn)
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="example@gmail.com"
              className={inputClass(!!errors.email)}
            />
            {errors.email && (
              <span className="text-xs text-error-text mt-1">
                {errors.email.message}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-ink mb-2">
            Ghi chú yêu cầu chung (Nếu có)
          </label>
          <textarea
            {...register("note")}
            rows={3}
            placeholder="Yêu cầu chung cho đoàn khách..."
            className="w-full resize-none rounded-sm border border-warm-100 bg-surface px-4 py-3 text-sm text-ink placeholder:text-warm-600 hover:border-warm-300 focus:outline-none focus:border-rose-600"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
          <button
            type="button"
            onClick={prevStep}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-warm-300 bg-surface px-6 py-3 font-bold text-ink transition-all hover:border-rose-400 hover:text-rose-600 disabled:border-warm-100 disabled:text-warm-300 sm:w-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 rounded-full font-bold transition-all bg-rose-600 text-white hover:bg-rose-500 disabled:bg-warm-50 disabled:text-warm-300 disabled:cursor-not-allowed"
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
