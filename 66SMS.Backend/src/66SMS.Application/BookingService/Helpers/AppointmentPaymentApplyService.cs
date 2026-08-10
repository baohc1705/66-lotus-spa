using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;

namespace _66SMS.Application.BookingService.Helpers
{
    // Áp dụng kết quả thanh toán VNPay thành công vào lịch hẹn (cọc hoặc thanh toán cuối)
    public static class AppointmentPaymentApplyService
    {
        public static Result<bool> ApplyVnPaySuccess(
            Appointment appointment,
            int phase,
            string transactionId,
            int? depositPercent = null)
        {
            if (phase == AppointmentPaymentConst.PHASE_DEPOSIT)
            {
                if (AppointmentPaymentCalculator.HasDepositPaid(appointment))
                    return Result<bool>.Success(false, "Đã thanh toán cọc trước đó");

                if (!AppointmentStatusTransitions.CanPayDeposit(appointment))
                    return Result<bool>.BadRequest("Lỗi: Không ở trạng thái chờ cọc hoặc đã cọc.");

                var percent = depositPercent ?? appointment.DepositPercent;
                if (percent == null)
                    return Result<bool>.BadRequest(
                        ConfigAppointmentConst.MSG_DEPOSIT_PERCENT_NOT_CONFIGURED,
                        ErrorCodes.ERR_CONFIG_APPOINTMENT_NOT_FOUND);

                var depositAmount = AppointmentPaymentCalculator.GetDepositAmount(
                    appointment.TotalAmount,
                    percent.Value);

                if (!AppointmentPaymentRecorder.TryRecordPayment(
                    appointment, AppointmentPaymentConst.PHASE_DEPOSIT, depositAmount,
                    AppointmentPaymentConst.METHOD_BANK_TRANSFER, transactionId, null, out var error))
                    return Result<bool>.BadRequest(error!);

                appointment.Status = AppointmentConst.STATUS_WAITING;
                appointment.UpdatedAt = DateTimeHelper.UtcNow();
                appointment.UpdatedBy = appointment.CreatedByUserId;

                return Result<bool>.Success(true, "Thanh toán cọc thành công");
            }

            if (AppointmentPaymentCalculator.IsFullyPaid(appointment))
                return Result<bool>.Success(false, "Đã thanh toán phần còn lại trước đó");

            if (!AppointmentStatusTransitions.CanPayBalance(appointment.Status))
                return Result<bool>.BadRequest("Lỗi: Không ở trạng thái chờ thanh toán.");

            var balanceAmount = AppointmentPaymentCalculator.GetRemainingAmount(appointment);

            if (!AppointmentPaymentRecorder.TryRecordPayment(
                appointment, AppointmentPaymentConst.PHASE_FINAL_PAYMENT, balanceAmount,
                AppointmentPaymentConst.METHOD_BANK_TRANSFER, transactionId, null, out var balanceErr))
                return Result<bool>.BadRequest(balanceErr!);

            appointment.UpdatedAt = DateTimeHelper.UtcNow();
            appointment.UpdatedBy = appointment.CreatedByUserId;

            return Result<bool>.Success(true, "Thanh toán phần còn lại thành công");
        }
    }
}
