using _66SMS.Application.DTOs.Appointments;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Appointments.Queries.GetTechnicians
{
    public class GetTechniciansQuery : IRequest<Result<IReadOnlyList<BookingTechnicianDto>>>
    {
        public DateOnly? Date { get; set; }
        public int? ServiceId { get; set; }
        public int? SalonId { get; set; }
    }
}
