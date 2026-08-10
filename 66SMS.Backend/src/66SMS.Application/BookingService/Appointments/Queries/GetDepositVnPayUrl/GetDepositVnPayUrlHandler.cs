using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Contract.Enumerations;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;
using _66SMS.Application.BookingService.Helpers;

namespace _66SMS.Application.BookingService.Appointments.Queries.GetDepositVnPayUrl
{
    public class GetDepositVnPayUrlHandler : IRequestHandler<GetDepositVnPayUrlQuery, Result<string>>
    {
        private readonly IAppointmentSqlRepository appointmentSqlRepository;
        private readonly IConfigAppointmentSqlRepository configAppointmentSqlRepository;
        private readonly IVnPayService vnPayService;

        public GetDepositVnPayUrlHandler(
            IAppointmentSqlRepository appointmentSqlRepository,
            IConfigAppointmentSqlRepository configAppointmentSqlRepository,
            IVnPayService vnPayService)
        {
            this.appointmentSqlRepository = appointmentSqlRepository;
            this.configAppointmentSqlRepository = configAppointmentSqlRepository;
            this.vnPayService = vnPayService;
        }

        public async Task<Result<string>> Handle(GetDepositVnPayUrlQuery request, CancellationToken cancellationToken)
        {
            var appointment = await appointmentSqlRepository.AsQueryable()
                .Where(x => x.Id == request.AppointmentId && x.Status != AppointmentConst.STATUS_CANCELLED)
                .FirstOrDefaultAsync(cancellationToken);
            if (appointment == null)
                return Result<string>.NotFound(AppointmentConst.MSG_APPOINTMENT_NOT_FOUND, ErrorCodes.ERR_APPOINTMENT_NOT_FOUND);

            if (!AppointmentStatusTransitions.CanPayDeposit(appointment))
                return Result<string>.BadRequest(AppointmentConst.MSG_APPOINTMENT_NOT_WAITING_DEPOSIT, ErrorCodes.ERR_APPOINTMENT_NOT_WAITING_DEPOSIT);

            var depositPercent = await AppointmentPaymentCalculator.GetEffectiveDepositPercentAsync(
                appointment,
                configAppointmentSqlRepository,
                cancellationToken);

            if (depositPercent == null)
                return Result<string>.BadRequest(ConfigAppointmentConst.MSG_DEPOSIT_PERCENT_NOT_CONFIGURED,ErrorCodes.ERR_CONFIG_APPOINTMENT_NOT_FOUND);

            var depositAmount = AppointmentPaymentCalculator.GetDepositAmount(appointment.TotalAmount, depositPercent.Value);

            var url = vnPayService.CreatePaymentUrl(appointment.Id, depositAmount, request.IpAddress!, AppointmentPaymentConst.PHASE_DEPOSIT);
            return Result<string>.Success(url);
        }
    }
}
