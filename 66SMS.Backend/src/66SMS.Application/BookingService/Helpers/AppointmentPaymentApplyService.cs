using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;

namespace _66SMS.Application.BookingService.Helpers
{
    // Áp dụng kết quả thanh toán VNPay thành công vào lịch hẹn (cọc hoặc thanh toán cuối)
    // Được gọi từ cả VnPayIpn (webhook server-to-server) và VnPayReturn (redirect về trang kết quả)
    public static class AppointmentPaymentApplyService
    {
        // Xử lý khi VNPay xác nhận giao dịch thành công, cập nhật trạng thái và lịch sử lịch hẹn
        // Trả về Success(false) nếu đã xử lý trước đó (idempotent - an toàn khi gọi nhiều lần)
        public static Result<object> ApplyVnPaySuccess(Appointment appointment, int phase, string transactionId)
        {
            // NHÁNH 1: THANH TOÁN CỌC
            if (phase == AppointmentPaymentConst.PHASE_DEPOSIT)
            {
                // Đã cọc rồi — bỏ qua để đảm bảo idempotent (IPN có thể gọi trước Return)
                if (AppointmentPaymentCalculator.HasDepositPaid(appointment))
                    return Result<object>.Success(false, "Đã thanh toán cọc trước đó");

                // Kiểm tra điều kiện: đúng trạng thái, còn hạn cọc, chưa cọc
                if (!AppointmentStatusTransitions.CanPayDeposit(appointment))
                    return Result<object>.BadRequest("Lỗi: Không ở trạng thái chờ cọc hoặc đã cọc.");

                var depositAmount = AppointmentPaymentCalculator.GetDepositAmount(
                    appointment.TotalAmount,
                    appointment.DepositPercent ?? AppointmentPaymentCalculator.DefaultDepositPercent);

                // Ghi nhận bản ghi thanh toán, nếu thất bại trả lỗi ngay
                if (!AppointmentPaymentRecorder.TryRecordPayment(
                    appointment, AppointmentPaymentConst.PHASE_DEPOSIT, depositAmount,
                    AppointmentPaymentConst.METHOD_BANK_TRANSFER, transactionId, "Deposited with VNPAY", out var error))
                    return Result<object>.BadRequest(error!);

                // Chuyển trạng thái sang "Chờ đến ngày" vì đã cọc xong
                var oldStatus = appointment.Status;
                appointment.Status = AppointmentConst.STATUS_WAITING;
                appointment.UpdatedAt = DateTime.UtcNow;
                appointment.UpdatedBy = appointment.CreatedByUserId;

                appointment.Histories ??= new List<AppointmentHistory>();
                appointment.Histories.Add(new AppointmentHistory
                {
                    OldStatus = oldStatus,
                    NewStatus = AppointmentConst.STATUS_WAITING,
                    Note = "Deposited with VNPAY",
                    CreatedAt = DateTimeHelper.UtcNow(),
                });

                return Result<object>.Success(true, "Thanh toán cọc thành công");
            }

            // NHÁNH 2: THANH TOÁN PHẦN CÒN LẠI (BALANCE)

            // Đã thanh toán đủ rồi — bỏ qua để đảm bảo idempotent
            if (AppointmentPaymentCalculator.IsFullyPaid(appointment))
                return Result<object>.Success(false, "Đã thanh toán phần còn lại trước đó");

            // Kiểm tra điều kiện: lịch hẹn phải ở trạng thái "Hoàn thành dịch vụ"
            if (!AppointmentStatusTransitions.CanPayBalance(appointment.Status))
                return Result<object>.BadRequest("Lỗi: Không ở trạng thái chờ thanh toán.");

            var balanceAmount = AppointmentPaymentCalculator.GetRemainingAmount(appointment);

            if (!AppointmentPaymentRecorder.TryRecordPayment(
                appointment, AppointmentPaymentConst.PHASE_FINAL_PAYMENT, balanceAmount,
                AppointmentPaymentConst.METHOD_BANK_TRANSFER, transactionId, "Thanh toán phần còn lại qua VNPAY", out var balanceErr))
                return Result<object>.BadRequest(balanceErr!);

            // Ghi lịch sử trạng thái (trạng thái lịch hẹn không đổi ở bước này, chỉ ghi nhận sự kiện)
            var oldBalanceStatus = appointment.Status;
            
            appointment.UpdatedAt = DateTime.UtcNow;
            appointment.UpdatedBy = appointment.CreatedByUserId;

            appointment.Histories ??= new List<AppointmentHistory>();
            appointment.Histories.Add(new AppointmentHistory
            {
                OldStatus = oldBalanceStatus,
                NewStatus = appointment.Status,
                Note = "Đã thanh toán VNPAY",
                CreatedAt = DateTimeHelper.UtcNow(),
            });

            return Result<object>.Success(true, "Thanh toán phần còn lại thành công");
        }
    }
}
