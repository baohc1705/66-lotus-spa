using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using _66SMS.Contracts.Helpers;

namespace _66SMS.Application.BookingService.Helpers
{
    /// <summary>
    /// Ghi nh?n m?t l?n thanh toán vào l?ch s? thanh toán c?a l?ch h?n
    /// </summary>
    public static class AppointmentPaymentRecorder
    {
        // Thêm b?n ghi thanh toán vào l?ch h?n và c?ng d?n s? ti?n dã tr?
        // Tr? v? false kèm thông báo l?i n?u s? ti?n không h?p l?
        public static bool TryRecordPayment(
             Appointment appointment, int phase, decimal amount, int method, string? transactionId, string note, out string? error)
        {
            error = null;

            // Không cho phép thanh toán 0 d?ng ho?c âm
            if (amount <= 0) { error = "S? ti?n thanh toán không h?p l?."; return false; }

            // C?ng d?n s? ti?n dã thanh toán vào t?ng c?a l?ch h?n
            appointment.PaidAmount += amount;

            // Thêm chi ti?t l?n thanh toán này vào danh sách (kh?i t?o danh sách n?u chua có)
            appointment.Payments ??= new List<AppointmentPayment>();
            appointment.Payments.Add(new AppointmentPayment
            {
                Phase = phase,           // Giai do?n: c?c (deposit) hay thanh toán cu?i (final)
                Amount = amount,
                Method = method,         // Phuong th?c: ti?n m?t, VNPay, ví...
                TransactionId = transactionId,
                Note = note,
                Status = AppointmentPaymentConst.STATUS_PAID,
                CreatedAt = DateTimeHelper.UtcNow(),
            });
            return true;
        }
    }
}
