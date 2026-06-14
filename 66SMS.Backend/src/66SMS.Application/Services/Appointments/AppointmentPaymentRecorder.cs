using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;

namespace _66SMS.Application.Services.Appointments
{
    public static class AppointmentPaymentRecorder
    {
        public static bool TryRecordPayment(
             Appointment appointment, int phase, decimal amount, int method, string? transactionId, string note, out string? error)
        {
            error = null;
            if (amount <= 0) { error = "Số tiền thanh toán không hợp lệ."; return false; }

            appointment.PaidAmount += amount;
            appointment.Payments ??= new List<AppointmentPayment>();
            appointment.Payments.Add(new AppointmentPayment
            {
                Phase = phase,
                Amount = amount,
                Method = method,
                TransactionId = transactionId,
                Note = note,
                Status = AppointmentPaymentConst.STATUS_PAID,
                CreatedAt = DateTime.UtcNow,
            });
            return true;
        }
    }
}
