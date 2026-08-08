using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.ConfigAppointments.Queries.GetAllConfigAppointments
{
    public class GetAllConfigAppointmentsQuery : PageRequest, IRequest<Result<PagedResult<ConfigAppointmentDto>>>
    {
        public int? SalonId { get; set; }
    }
}
