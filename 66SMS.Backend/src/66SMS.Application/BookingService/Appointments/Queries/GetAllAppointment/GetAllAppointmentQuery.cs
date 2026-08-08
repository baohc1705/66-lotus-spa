using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Appointments.Queries.GetAllAppointment
{
    public class GetAllAppointmentQuery : PageRequest, IRequest<Result<PagedResult<AppointmentDto>>>
    {
        public int? UserId { get; set; }
        public int? SalonId { get; set; }
    }
}
