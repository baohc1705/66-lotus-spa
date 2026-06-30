using _66SMS.Domain.Entities;

namespace _66SMS.Application.BookingService.Helpers
{
    /// <summary>
    /// Tính toán các con số liên quan đến tiền cọc và thanh toán lịch hẹn
    /// </summary>
    public static class AppointmentPaymentCalculator
    {
        // Tỉ lệ cọc mặc định nếu lịch hẹn không chỉ định riêng
        public const int DefaultDepositPercent = 20;

        // Tính số tiền cọc dựa trên tổng tiền và tỉ lệ phần trăm, làm tròn lên đơn vị đồng
        public static decimal GetDepositAmount(decimal? totalAmount, int depositPercent = DefaultDepositPercent)
        {
            var total = totalAmount ?? 0m;
            if (total <= 0m)
            {
                return 0m;
            }

            // AwayFromZero: x.5 làm tròn lên thay vì làm tròn về số chẵn (banker's rounding)
            return Math.Round(total * depositPercent / 100m, 0, MidpointRounding.AwayFromZero);
        }

        // Số tiền còn lại phải trả = tổng tiền - đã trả (không bao giờ trả về số âm)
        public static decimal GetRemainingAmount(Appointment appointment) =>
            Math.Max(0m, appointment.TotalAmount - appointment.PaidAmount);

        // Kiểm tra khách đã đặt cọc đủ chưa (đã trả >= số tiền cọc yêu cầu)
        public static bool HasDepositPaid(Appointment appointment) =>
            appointment.PaidAmount >= GetDepositAmount(appointment.TotalAmount, appointment.DepositPercent ?? DefaultDepositPercent);

        // Kiểm tra khách đã thanh toán toàn bộ chưa (đã trả >= tổng tiền)
        public static bool IsFullyPaid(Appointment appointment) =>
            appointment.PaidAmount >= appointment.TotalAmount;
    }
}
