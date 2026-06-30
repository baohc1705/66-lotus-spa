using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;

namespace _66SMS.Application.BookingService.Helpers
{
    /// <summary>
    /// Ghi nhận một lần thanh toán vào lịch sử thanh toán của lịch hẹn
    /// </summary>
    public static class AppointmentPaymentRecorder
    {
        // Thêm bản ghi thanh toán vào lịch hẹn và cộng dồn số tiền đã trả
        // Trả về false kèm thông báo lỗi nếu số tiền không hợp lệ
        public static bool TryRecordPayment(
             Appointment appointment, int phase, decimal amount, int method, string? transactionId, string note, out string? error)
        {
            error = null;

            // Không cho phép thanh toán 0 đồng hoặc âm
            if (amount <= 0) { error = "Số tiền thanh toán không hợp lệ."; return false; }

            // Cộng dồn số tiền đã thanh toán vào tổng của lịch hẹn
            appointment.PaidAmount += amount;

            // Thêm chi tiết lần thanh toán này vào danh sách (khởi tạo danh sách nếu chưa có)
            appointment.Payments ??= new List<AppointmentPayment>();
            appointment.Payments.Add(new AppointmentPayment
            {
                Phase = phase,           // Giai đoạn: cọc (deposit) hay thanh toán cuối (final)
                Amount = amount,
                Method = method,         // Phương thức: tiền mặt, VNPay, ví...
                TransactionId = transactionId,
                Note = note,
                Status = AppointmentPaymentConst.STATUS_PAID,
                CreatedAt = DateTime.UtcNow,
            });
            return true;
        }
    }
}
