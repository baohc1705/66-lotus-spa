using _66SMS.Contracts.Helpers;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;

namespace _66SMS.Application.BookingService.Helpers
{
    /// <summary>
    /// Kiểm tra điều kiện hợp lệ trước khi thực hiện các bước thanh toán lịch hẹn
    /// </summary>
    public static class AppointmentStatusTransitions
    {
        // Được phép đặt cọc khi: lịch hẹn đã xác nhận, còn trong hạn cọc và chưa cọc lần nào
        public static bool CanPayDeposit(Appointment appointment)
        {
            return appointment.Status == AppointmentConst.STATUS_CONFIRMED
              && appointment.DepositDeadlineAt != null
              && appointment.DepositDeadlineAt > DateTimeHelper.UtcNow()
              && !AppointmentPaymentCalculator.HasDepositPaid(appointment);
        }

        // Được phép thanh toán phần còn lại khi lịch hẹn đã hoàn thành dịch vụ
        public static bool CanPayBalance(int status)
        {
            return status == AppointmentConst.STATUS_COMPLETED;
        }
    }
}
