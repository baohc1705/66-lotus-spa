using _66SMS.Application.DTOs;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.ConfigAppointments.Queries.GetConfigAppointmentBySalon
{
    public class GetConfigAppointmentBySalonHandler
        : IRequestHandler<GetConfigAppointmentBySalonQuery, Result<ConfigAppointmentDto>>
    {
        private readonly IConfigAppointmentSqlRepository configAppointmentSqlRepository;

        public GetConfigAppointmentBySalonHandler(
            IConfigAppointmentSqlRepository configAppointmentSqlRepository)
        {
            this.configAppointmentSqlRepository = configAppointmentSqlRepository;
        }

        public async Task<Result<ConfigAppointmentDto>> Handle(
            GetConfigAppointmentBySalonQuery request,
            CancellationToken cancellationToken)
        {
            ConfigAppointmentDto? dto = await configAppointmentSqlRepository.AsQueryable(asNoTracking: true)
                .Where(x => x.SalonId == request.SalonId)
                .Select(x => new ConfigAppointmentDto
                {
                    Id = x.Id,
                    DepositPercent = x.DepositPercent,
                    StartTime = x.StartTime,
                    EndTime = x.EndTime,
                    SlotMinutes = x.SlotMinutes,
                    SalonId = x.SalonId,
                    SalonName = x.Salon != null ? x.Salon.Name : null,
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (dto == null)
                return Result<ConfigAppointmentDto>.NotFound(
                    ConfigAppointmentConst.MSG_NOT_FOUND,
                    ErrorCodes.ERR_CONFIG_APPOINTMENT_NOT_FOUND);

            if (dto.DepositPercent == null)
                return Result<ConfigAppointmentDto>.BadRequest(
                    ConfigAppointmentConst.MSG_DEPOSIT_PERCENT_NOT_CONFIGURED,
                    ErrorCodes.ERR_CONFIG_APPOINTMENT_NOT_FOUND);

            return Result<ConfigAppointmentDto>.Success(dto);
        }
    }
}
