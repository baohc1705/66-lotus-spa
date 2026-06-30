using _66SMS.Application.Services.Appointments;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Contracts.Enumerations;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Cashier.Queries.GetCashierVnPayUrl
{
    public sealed class GetCashierVnPayUrlHandler(
        IAppointmentSqlRepository appointmentRepository,
        IVnPayService vnPayService)
        : IRequestHandler<GetCashierVnPayUrlQuery, Result<string>>
    {
        public async Task<Result<string>> Handle(GetCashierVnPayUrlQuery request, CancellationToken cancellationToken)
        {
            var appointment = await appointmentRepository.AsQueryable(asNoTracking: true)
                .Include(a => a.Payments)
                .FirstOrDefaultAsync(a => a.Id == request.AppointmentId, cancellationToken);

            if (appointment == null)
                return Result<string>.NotFound(AppointmentConst.MSG_APPOINTMENT_NOT_FOUND, ErrorCodes.ERR_APPOINTMENT_NOT_FOUND);

            if (AppointmentPaymentCalculator.IsFullyPaid(appointment))
                return Result<string>.BadRequest(AppointmentConst.MSG_APPOINTMENT_ALREADY_PAID, ErrorCodes.ERR_APPOINTMENT_ALREADY_PAID);

            if (!AppointmentStatusTransitions.CanPayBalance(appointment.Status))
            {
                return Result<string>.BadRequest(
                    "Chỉ thanh toán khi dịch vụ đã hoàn tất và lịch ở trạng thái chờ thanh toán.");
            }

            if (!AppointmentPaymentCalculator.HasDepositPaid(appointment))
                return Result<string>.BadRequest(AppointmentConst.MSG_APPOINTMENT_NOT_DEPOSITED_YET, ErrorCodes.ERR_APPOINTMENT_NOT_DEPOSITED_YET);

            var amount = AppointmentPaymentCalculator.GetRemainingAmount(appointment);
            if (amount <= 0)
                return Result<string>.BadRequest(AppointmentConst.MSG_APPOINTMENT_NO_REMAINING_AMOUNT, ErrorCodes.ERR_APPOINTMENT_NO_REMAINING_AMOUNT);

            var description = $"Thanh toan phan con lai don {appointment.Id}";
            var url = vnPayService.CreatePaymentUrl(
                appointment.Id,
                amount,
                description,
                request.IpAddress,
                AppointmentPaymentConst.PHASE_FINAL_PAYMENT);

            return Result<string>.Success(url, "Success");
        }
    }
}
