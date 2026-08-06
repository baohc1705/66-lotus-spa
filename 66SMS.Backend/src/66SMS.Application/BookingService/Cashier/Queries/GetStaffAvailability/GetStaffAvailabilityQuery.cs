using _66SMS.Application.DTOs;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Cashier.Queries.GetStaffAvailability
{
    public class GetStaffAvailabilityQuery : IRequest<Result<IReadOnlyList<StaffAvailabilityDto>>>
    {
        public DateOnly Date { get; set; }
        public int SlotId { get; set; }
        public int ServiceId { get; set; }
        public int? SalonId { get; set; }
    }
}
