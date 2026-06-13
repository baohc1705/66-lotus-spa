using _66SMS.Application.DTOs.Appointments;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;

namespace _66SMS.Application.Features.Appointments.Queries.GetAllAppointment
{
    public class GetAllAppointmentHandler : IRequestHandler<GetAllAppointmentQuery, Result<PagedResult<AppointmentDto>>>
    {
        private readonly IAppointmentSqlRepository appointmentSqlRepository;
        private readonly IMapper mapper;
        public GetAllAppointmentHandler(IAppointmentSqlRepository appointmentSqlRepository, IMapper mapper)
        {
            this.appointmentSqlRepository = appointmentSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<PagedResult<AppointmentDto>>> Handle(GetAllAppointmentQuery request, CancellationToken cancellationToken)
        {
            var query = appointmentSqlRepository.AsQueryable();
            if (request.UserId != null && request.UserId > 0)
            {
                query = query.Where(x => x.CreatedByUserId == request.UserId);
            }
            var result = await query
                .ProjectTo<AppointmentDto>(mapper.ConfigurationProvider)
                .ToPagedAsync(request, cancellationToken);
            return Result<PagedResult<AppointmentDto>>.Success(result);
        }
    }
}
