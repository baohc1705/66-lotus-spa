using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using _66SMS.Contracts.Helpers;

namespace _66SMS.Application.BookingService.Helpers
{
    public static class AppointmentPaymentRecorder
    {
        public static bool TryRecordPayment(
             Appointment appointment, int phase, decimal amount, int method, string? transactionId, string? note, out string? error)
        {
            error = null;
            if (amount <= 0) { error = "S? ti?n thanh toán không h?p l?."; return false; }

            // Không ghi v??t t?ng ti?n l?ch (d?ch v?) — ti?n SP ch? n?m trên hóa ??n
            var maxAddable = Math.Max(0m, appointment.TotalAmount - appointment.PaidAmount);
            if (amount > maxAddable)
                amount = maxAddable;
            if (amount <= 0)
                return true;

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
                CreatedAt = DateTimeHelper.UtcNow(),
            });
            return true;
        }
    }
}
