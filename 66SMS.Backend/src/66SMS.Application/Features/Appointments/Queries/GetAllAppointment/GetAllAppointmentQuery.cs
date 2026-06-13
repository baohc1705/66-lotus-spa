using _66SMS.Application.DTOs.Appointments;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Appointments.Queries.GetAllAppointment
{
    public class GetAllAppointmentQuery : PageRequest, IRequest<Result<PagedResult<AppointmentDto>>>
    {
        public int? UserId { get; set; }
    }
}
