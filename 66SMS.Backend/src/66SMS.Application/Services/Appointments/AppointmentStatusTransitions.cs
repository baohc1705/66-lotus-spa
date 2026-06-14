using _66SMS.Contracts.Helpers;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;

namespace _66SMS.Application.Services.Appointments
{
    /// <summary>
    /// Kiểm tra điều kiện chuyển đổi trạng thái/thanh toán
    /// </summary>
    public static class AppointmentStatusTransitions
    {
        public static bool CanPayDeposit(Appointment appointment)
        {
            return appointment.Status == AppointmentConst.STATUS_CONFIRMED
              && appointment.DepositDeadlineAt != null
              && appointment.DepositDeadlineAt > DateTimeHelper.UtcNow()
              && !AppointmentPaymentCalculator.HasDepositPaid(appointment);
        }

        public static bool CanPayBalance(int status)
        {
            return status == AppointmentConst.STATUS_COMPLETED;
        }
    }
}
