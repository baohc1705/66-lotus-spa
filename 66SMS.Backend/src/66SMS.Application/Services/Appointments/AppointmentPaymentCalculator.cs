using _66SMS.Domain.Entities;

namespace _66SMS.Application.Services.Appointments
{
    public static class AppointmentPaymentCalculator
    {
        /// <summary>
        /// Tính toán tiền cọc và phần còn lại
        /// </summary>
        public const int DefaultDepositPercent = 20;

        public static decimal GetDepositAmount(decimal? totalAmount, int depositPercent = DefaultDepositPercent)
        {
            var total = totalAmount ?? 0m;
            if (total <= 0m)
            {
                return 0m;
            }
            return Math.Round(total * depositPercent / 100m, 0, MidpointRounding.AwayFromZero);
        }

        public static decimal GetRemainingAmount(Appointment appointment) => Math.Max(0m, (appointment.TotalAmount != null ? appointment.TotalAmount : 0m) - appointment.PaidAmount);
        public static bool HasDepositPaid(Appointment appointment) => appointment.PaidAmount >= GetDepositAmount(appointment.TotalAmount, appointment.DepositPercent ?? DefaultDepositPercent);
        public static bool IsFullyPaid(Appointment appointment) => appointment.PaidAmount >= (appointment.TotalAmount != null ? appointment.TotalAmount : 0m);

    }
}
