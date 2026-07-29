import {
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/stores/authStore";
import {
  useMembershipTiers,
  useMyMembershipCard,
} from "@/features/profile/hooks/useMembershipInfo";
import { useConfigAppointmentBySalon } from "@/features/config_appointments/hooks/useConfigAppointments";
import { formatDate } from "@/shared/utils/date.utils";
import { useBookingStore } from "../stores/bookingStore";
import { PromotionCodeInput } from "./PromotionCodeInput";

function TicketPunchRow({ edge }: { edge: "top" | "bottom" }) {
  const holeCount = 15;

  return (
    <div
      className={`absolute left-0 right-0 flex justify-center gap-2 z-10 pointer-events-none px-4 ${
        edge === "top" ? "top-0 -translate-y-1/2" : "bottom-0 translate-y-1/2"
      }`}
      aria-hidden
    >
      {Array.from({ length: holeCount }).map((_, i) => (
        <div
          key={`${edge}-${i}`}
          className="w-4 h-4 rounded-full bg-page shadow-sm shrink-0"
        />
      ))}
    </div>
  );
}

function TicketDivider() {
  return <div className="h-px bg-warm-100" />;
}

const DEFAULT_DEPOSIT_PERCENT = 20;

export function BookingSummarySidebar() {
  const {
    guests,
    activeGuestIndex,
    setActiveGuest,
    addGuest,
    removeGuest,
    selectedSalon,
    appliedPromotion,
  } = useBookingStore();

  const accessToken = useAuthStore((s) => s.accessToken);
  const membershipCardQuery = useMyMembershipCard(!!accessToken);
  const tiersQuery = useMembershipTiers();
  const configQuery = useConfigAppointmentBySalon(selectedSalon?.id);

  const depositPercent =
    configQuery.data?.data?.depositPercent ?? DEFAULT_DEPOSIT_PERCENT;

  const membershipTier = tiersQuery.data?.find(
    (t) => t.id === membershipCardQuery.data?.membershipTierId,
  );
  const membershipPercent = membershipTier?.discountPercent ?? 0;

  const servicesSubTotal = guests.reduce(
    (sum, g) => sum + (g.selectedService?.sellingPrice || 0),
    0,
  );

  const membershipDiscount =
    membershipPercent > 0 && servicesSubTotal > 0
      ? Math.round((servicesSubTotal * membershipPercent) / 100)
      : 0;

  const promoDiscount = appliedPromotion ? appliedPromotion.discountAmount : 0;
  const finalTotal = Math.max(
    0,
    servicesSubTotal - membershipDiscount - promoDiscount,
  );
  const deposit = Math.round((finalTotal * depositPercent) / 100);

  return (
    <div className="relative">
      <div className="lotus-panel relative overflow-visible">
        <TicketPunchRow edge="top" />
        <div className="flex flex-col gap-4 p-5 pt-6">
          <div className="pt-1 text-center">
            <h3 className="flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-rose-600">
              Chi tiết đặt chỗ
            </h3>
          </div>

          <TicketDivider />

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                Khách hàng
              </p>
              <button
                onClick={addGuest}
                className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-400 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm
              </button>
            </div>

            {guests.map((guest, index) => {
              const isGuestActive = activeGuestIndex === index;
              const sellingPrice = guest.selectedService?.sellingPrice || 0;

              return (
                <div key={guest.id} className="flex flex-col gap-2">
                  <div
                    className={`flex items-center justify-between px-4 py-2.5 rounded-full cursor-pointer border-2 transition-all ${
                      isGuestActive
                        ? "border-rose-600 bg-rose-50"
                        : "border-rose-200 bg-rose-50/50 hover:border-rose-400"
                    }`}
                    onClick={() => setActiveGuest(index)}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-rose-600" />
                      </div>
                      <span className="text-sm font-bold text-rose-600">
                        Khách {index + 1}
                      </span>
                      {sellingPrice > 0 && (
                        <span className="text-xs font-semibold text-ink">
                          · {sellingPrice.toLocaleString("vi-VN")}đ
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {guests.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeGuest(index);
                          }}
                          className="text-warm-400 hover:text-error-text transition-colors p-1"
                          title="Xóa khách này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <ChevronRight
                        className={`w-4 h-4 text-rose-600 transition-transform ${
                          isGuestActive ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {isGuestActive && (
                    <div className="px-2 flex flex-col gap-3 text-xs text-ink">
                      {selectedSalon ? (
                        <div className="flex items-center gap-3 rounded-sm border border-warm-100 bg-warm-50 p-3">
                          {selectedSalon.imageUrl ? (
                            <img
                              src={selectedSalon.imageUrl}
                              alt={selectedSalon.name}
                              className="w-10 h-10 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0 text-base">
                              SPA
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-2xs font-bold uppercase tracking-wider text-gold-600 mb-0.5">
                              Chi nhánh
                            </p>
                            <div className="font-bold text-ink truncate">
                              {selectedSalon.name}
                            </div>
                            {selectedSalon.fullAddress && (
                              <div className="text-warm-600 line-clamp-2 mt-0.5 flex items-start gap-1">
                                <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                                {selectedSalon.fullAddress}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-warm-600 italic px-2">
                          Chưa chọn chi nhánh
                        </div>
                      )}

                      {guest.selectedService ? (
                        <div className="px-2">
                          <p className="text-2xs font-bold tracking-wider text-gold-600 uppercase mb-1">
                            Dịch vụ
                          </p>
                          <div className="font-bold line-clamp-1">
                            {guest.selectedService.name}
                          </div>
                          <div className="flex justify-between items-center text-ink mt-1">
                            <span className="flex items-center gap-1 text-warm-600">
                              <Clock className="w-3.5 h-3.5 text-rose-400" />
                              {guest.selectedService.durationMins} phút
                            </span>
                            <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full text-2xs uppercase">
                              {guest.selectedService.categoryName || "Dịch vụ"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-warm-600 italic px-2">
                          Chưa chọn dịch vụ
                        </div>
                      )}

                      {(guest.selectedDate ||
                        guest.selectedTimeSlot ||
                        guest.selectedTechnician) && (
                        <div className="px-2 flex flex-col gap-1.5">
                          {guest.selectedDate && guest.selectedTimeSlot && (
                            <div className="flex justify-between items-center">
                              <span className="text-warm-600">Thời gian:</span>
                              <span className="font-bold text-rose-600">
                                {guest.selectedTimeSlot.time} ·{" "}
                                {formatDate(guest.selectedDate).format(
                                  "DD/MM/YYYY",
                                )}
                              </span>
                            </div>
                          )}
                          {guest.selectedTechnician && (
                            <div className="flex justify-between items-center">
                              <span className="text-warm-600">
                                Kỹ thuật viên:
                              </span>
                              <span className="font-semibold">
                                {guest.selectedTechnician.name}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <TicketDivider />

          <PromotionCodeInput variant="ticket" />

          <TicketDivider />

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs text-warm-600">
              <span>Số lượng khách:</span>
              <span className="font-bold text-ink">{guests.length} khách</span>
            </div>

            <div className="flex justify-between text-xs text-warm-600">
              <span>Tổng tiền dịch vụ:</span>
              <span className="font-bold text-ink">
                {servicesSubTotal.toLocaleString("vi-VN")}đ
              </span>
            </div>

            {membershipDiscount > 0 && (
              <div className="flex justify-between text-xs text-success-text font-semibold">
                <span>
                  Giảm giá thẻ thành viên
                  {membershipPercent > 0 ? ` (${membershipPercent}%)` : ""}:
                </span>
                <span>-{membershipDiscount.toLocaleString("vi-VN")}đ</span>
              </div>
            )}

            {promoDiscount > 0 && (
              <div className="flex justify-between text-xs text-success-text font-semibold">
                <span>Giảm giá mã khuyến mãi:</span>
                <span>-{promoDiscount.toLocaleString("vi-VN")}đ</span>
              </div>
            )}

            <div className="flex justify-between items-end pt-1">
              <span className="text-sm font-bold text-ink uppercase">
                Tổng cộng
              </span>
              <span className="text-2xl font-black text-rose-600">
                {finalTotal.toLocaleString("vi-VN")}đ
              </span>
            </div>

            <div className="flex justify-between items-center text-xs text-warm-600">
              <span>Thanh toán cọc ({depositPercent}%):</span>
              <span className="font-bold text-ink">
                {deposit.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>

          <TicketDivider />

          {/* <div className="grid grid-cols-3 gap-3">
            {[
              {
                icon: CalendarCheck,
                color: "text-rose-600",
                title: "Xác nhận ngay",
                subtitle: "Đặt lịch nhanh chóng",
              },
              {
                icon: RotateCcw,
                color: "text-gold-600",
                title: "Miễn phí hủy",
                subtitle: "Trước 2 giờ",
              },
              {
                icon: ShieldCheck,
                color: "text-rose-600",
                title: "Bảo mật tuyệt đối",
                subtitle: "Thông tin của bạn",
              },
            ].map(({ icon: Icon, color, title, subtitle }) => (
              <div
                key={title}
                className="flex flex-col items-center gap-1 text-center"
              >
                <Icon className={`w-5 h-5 ${color}`} />
                <span className="text-2xs font-bold text-ink leading-tight">
                  {title}
                </span>
                <span className="text-3xs text-warm-600 leading-tight">
                  {subtitle}
                </span>
              </div>
            ))}
          </div> */}
        </div>

        <TicketPunchRow edge="bottom" />

        {/* <div className="px-4 pb-5 pt-2 text-2xs text-warm-600 leading-relaxed text-center flex flex-col gap-0.5">
          <span>Miễn phí hủy lịch trước 2 giờ</span>
          <span>Bảo mật thông tin tuyệt đối</span>
        </div> */}
      </div>
    </div>
  );
}
