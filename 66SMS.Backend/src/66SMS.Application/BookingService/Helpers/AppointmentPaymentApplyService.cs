using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;

namespace _66SMS.Application.BookingService.Helpers
{
    // Áp dụng kết quả thanh toán VNPay thành công vào lịch hẹn (cọc hoặc thanh toán cuối)
    public static class AppointmentPaymentApplyService
    {
        public static Result<object> ApplyVnPaySuccess(Appointment appointment, int phase, string transactionId)
        {
            if (phase == AppointmentPaymentConst.PHASE_DEPOSIT)
            {
                if (AppointmentPaymentCalculator.HasDepositPaid(appointment))
                    return Result<object>.Success(false, "Đã thanh toán cọc trước đó");

                if (!AppointmentStatusTransitions.CanPayDeposit(appointment))
                    return Result<object>.BadRequest("Lỗi: Không ở trạng thái chờ cọc hoặc đã cọc.");

                var depositAmount = AppointmentPaymentCalculator.GetDepositAmount(
                    appointment.TotalAmount,
                    appointment.DepositPercent ?? AppointmentPaymentCalculator.DefaultDepositPercent);

                if (!AppointmentPaymentRecorder.TryRecordPayment(
                    appointment, AppointmentPaymentConst.PHASE_DEPOSIT, depositAmount,
                    AppointmentPaymentConst.METHOD_BANK_TRANSFER, transactionId, "Deposited with VNPAY", out var error))
                    return Result<object>.BadRequest(error!);

                appointment.Status = AppointmentConst.STATUS_WAITING;
                appointment.UpdatedAt = DateTimeHelper.UtcNow();
                appointment.UpdatedBy = appointment.CreatedByUserId;

                return Result<object>.Success(true, "Thanh toán cọc thành công");
            }

            if (AppointmentPaymentCalculator.IsFullyPaid(appointment))
                return Result<object>.Success(false, "Đã thanh toán phần còn lại trước đó");

            if (!AppointmentStatusTransitions.CanPayBalance(appointment.Status))
                return Result<object>.BadRequest("Lỗi: Không ở trạng thái chờ thanh toán.");

            var balanceAmount = AppointmentPaymentCalculator.GetRemainingAmount(appointment);

            if (!AppointmentPaymentRecorder.TryRecordPayment(
                appointment, AppointmentPaymentConst.PHASE_FINAL_PAYMENT, balanceAmount,
                AppointmentPaymentConst.METHOD_BANK_TRANSFER, transactionId, "Thanh toán phần còn lại qua VNPAY", out var balanceErr))
                return Result<object>.BadRequest(balanceErr!);

            appointment.UpdatedAt = DateTimeHelper.UtcNow();
            appointment.UpdatedBy = appointment.CreatedByUserId;

            return Result<object>.Success(true, "Thanh toán phần còn lại thành công");
        }
    }
}
