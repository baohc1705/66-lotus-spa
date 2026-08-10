using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using _66SMS.Contract.Helpers;

namespace _66SMS.Application.BookingService.Helpers
{
    public static class AppointmentPaymentRecorder
    {
        public static bool TryRecordPayment(
             Appointment appointment, int phase, decimal amount, int method, string? transactionId, string? note, out string? error)
        {
            error = null;
            if (amount <= 0) { error = "Số tiền thanh toán không hợp lệ."; return false; }

            var maxAddable = Math.Max(0m, appointment.TotalAmount - appointment.PaidAmount);
            if (amount > maxAddable)
                amount = maxAddable;
            if (amount <= 0)
                return true;

            appointment.PaidAmount += amount;
            appointment.Payments ??= new List<AppointmentPayment>();
            var payment = new AppointmentPayment
            {
                Phase = phase,
                Amount = amount,
                Method = method,
                TransactionId = transactionId,
                Status = AppointmentPaymentConst.STATUS_PAID,
                CreatedAt = DateTimeHelper.UtcNow(),
            };
            if (note != null)
                payment.Note = note;
            appointment.Payments.Add(payment);
            return true;
        }
    }
}
