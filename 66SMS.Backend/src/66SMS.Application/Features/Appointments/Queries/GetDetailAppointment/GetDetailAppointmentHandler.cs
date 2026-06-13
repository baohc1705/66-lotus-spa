using _66SMS.Application.DTOs.Appointments;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using AutoMapper;
using MediatR;

namespace _66SMS.Application.Features.Appointments.Queries.GetDetailAppointment
{
    public class GetDetailAppointmentHandler : IRequestHandler<GetDetailAppointmentQuery, Result<AppointmentDto>>
    {
        private readonly IAppointmentSqlRepository appointmentSqlRepository;
        private readonly IMapper mapper;
        public GetDetailAppointmentHandler(IAppointmentSqlRepository appointmentSqlRepository, IMapper mapper)
        {
            this.appointmentSqlRepository = appointmentSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<AppointmentDto>> Handle(GetDetailAppointmentQuery request, CancellationToken cancellationToken)
        {
            var appointment = await appointmentSqlRepository.FindByIdAsync((int)request.Id);
            if (appointment == null) return Result<AppointmentDto>.NotFound("Lịch hẹn không tồn tại.");
            var dto = mapper.Map<AppointmentDto>(appointment);
            return Result<AppointmentDto>.Success(dto);
        }
    }
}
