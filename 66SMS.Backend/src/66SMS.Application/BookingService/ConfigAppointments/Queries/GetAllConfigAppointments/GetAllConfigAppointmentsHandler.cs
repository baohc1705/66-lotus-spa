using _66SMS.Application.DTOs.ConfigAppointments;
using _66SMS.Contract.Extensions;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;

namespace _66SMS.Application.BookingService.ConfigAppointments.Queries.GetAllConfigAppointments
{
    public class GetAllConfigAppointmentsHandler : IRequestHandler<GetAllConfigAppointmentsQuery, Result<PagedResult<ConfigAppointmentDto>>>
    {
        private readonly IConfigAppointmentSqlRepository configAppointmentSqlRepository;

        public GetAllConfigAppointmentsHandler(IConfigAppointmentSqlRepository configAppointmentSqlRepository)
        {
            this.configAppointmentSqlRepository = configAppointmentSqlRepository;
        }

        public async Task<Result<PagedResult<ConfigAppointmentDto>>> Handle(GetAllConfigAppointmentsQuery request, CancellationToken cancellationToken)
        {
            var query = configAppointmentSqlRepository.AsQueryable(asNoTracking: true);

            if (request.SalonId.HasValue)
            {
                query = query.Where(x => x.SalonId == request.SalonId.Value);
            }

            PagedResult<ConfigAppointmentDto> result = await query
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
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<ConfigAppointmentDto>>.Success(result);
        }
    }
}
