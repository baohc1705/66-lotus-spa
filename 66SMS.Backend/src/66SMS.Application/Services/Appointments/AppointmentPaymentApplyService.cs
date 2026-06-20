using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;

namespace _66SMS.Application.Services.Appointments
{
    public static class AppointmentPaymentApplyService
    {
        public static Result<object> ApplyVnPaySuccess(Appointment appointment, int phase, string transactionId)
        {
            // THANH TOÁN CỌC (DEPOSIT)
            if (phase == AppointmentPaymentConst.PHASE_DEPOSIT)
            {
                if (AppointmentPaymentCalculator.HasDepositPaid(appointment))
                    return Result<object>.Ok(); // Đã thanh toán (do IPN xử lý trước)

                if (!AppointmentStatusTransitions.CanPayDeposit(appointment))
                    return Result<object>.BadRequest("Lỗi: Không ở trạng thái chờ cọc hoặc đã cọc.");
                var depositAmount = AppointmentPaymentCalculator.GetDepositAmount(appointment.TotalAmount, appointment.DepositPercent ?? AppointmentPaymentCalculator.DefaultDepositPercent);
                if (!AppointmentPaymentRecorder.TryRecordPayment(appointment, AppointmentPaymentConst.PHASE_DEPOSIT, depositAmount, AppointmentPaymentConst.METHOD_BANK_TRANSFER, transactionId, "Deposited with VNPAY", out var error))
                    return Result<object>.BadRequest(error!);
                var oldStatus = appointment.Status;
                appointment.Status = AppointmentConst.STATUS_WAITING;
                appointment.Histories ??= new List<AppointmentHistory>();
                appointment.Histories.Add(new AppointmentHistory
                {
                    OldStatus = oldStatus,
                    NewStatus = AppointmentConst.STATUS_WAITING,
                    Note = "Deposited with VNPAY",
                    CreatedAt = DateTimeHelper.UtcNow(),
                });

                return Result<object>.Ok();
            }

            // THANH TOÁN PHẦN CÒN LẠI (BALANCE)
            if (AppointmentPaymentCalculator.IsFullyPaid(appointment))
                return Result<object>.Ok(); // Đã thanh toán (do IPN xử lý trước)

            if (!AppointmentStatusTransitions.CanPayBalance(appointment.Status))
            {
                return Result<object>.BadRequest("Lỗi: Không ở trạng thái chờ thanh toán.");
            }

            var balanceAmount = AppointmentPaymentCalculator.GetRemainingAmount(appointment);
            if (!AppointmentPaymentRecorder.TryRecordPayment(appointment, AppointmentPaymentConst.PHASE_FINAL_PAYMENT, balanceAmount, AppointmentPaymentConst.METHOD_BANK_TRANSFER, transactionId, "Thanh toán phần còn lại qua VNPAY", out var balanceErr))
                return Result<object>.BadRequest(balanceErr!);

            var oldBalanceStatus = appointment.Status;
            appointment.Histories ??= new List<AppointmentHistory>();
            appointment.Histories.Add(new AppointmentHistory
            {
                OldStatus = oldBalanceStatus,
                NewStatus = appointment.Status,
                Note = "Đã thanh toán VNPAY",
                CreatedAt = DateTimeHelper.UtcNow(),
            });

            return Result<object>.Ok();
        }
    }
}
