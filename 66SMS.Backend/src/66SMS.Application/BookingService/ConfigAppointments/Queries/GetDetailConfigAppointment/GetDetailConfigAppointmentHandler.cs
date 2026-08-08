using _66SMS.Application.DTOs;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.ConfigAppointments.Queries.GetDetailConfigAppointment
{
    public class GetDetailConfigAppointmentHandler : IRequestHandler<GetDetailConfigAppointmentQuery, Result<ConfigAppointmentDto>>
    {
        private readonly IConfigAppointmentSqlRepository configAppointmentSqlRepository;

        public GetDetailConfigAppointmentHandler(IConfigAppointmentSqlRepository configAppointmentSqlRepository)
        {
            this.configAppointmentSqlRepository = configAppointmentSqlRepository;
        }

        public async Task<Result<ConfigAppointmentDto>> Handle(GetDetailConfigAppointmentQuery request, CancellationToken cancellationToken)
        {
            ConfigAppointmentDto? dto = await configAppointmentSqlRepository.AsQueryable(asNoTracking: true)
                .Where(x => x.Id == request.Id)
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
            {
                return Result<ConfigAppointmentDto>.NotFound(ConfigAppointmentConst.MSG_NOT_FOUND, ErrorCodes.ERR_CONFIG_APPOINTMENT_NOT_FOUND);
            }

            return Result<ConfigAppointmentDto>.Success(dto);
        }
    }
}
