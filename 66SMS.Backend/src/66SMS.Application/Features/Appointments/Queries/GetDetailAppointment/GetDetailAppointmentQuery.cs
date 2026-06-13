using _66SMS.Application.DTOs.Appointments;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Appointments.Queries.GetDetailAppointment
{
    public class GetDetailAppointmentQuery : IRequest<Result<AppointmentDto>>
    {
        public int? Id { get; set; }
    }
}
