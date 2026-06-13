using _66SMS.Application.DTOs.Appointments;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Appointments.Queries.GetTechnicians
{
    public class GetTechniciansQuery : IRequest<Result<IReadOnlyList<BookingTechnicianDto>>>
    {
        public DateOnly? Date {  get; set; }
        public int ServiceId { get; set; }
    }
}
