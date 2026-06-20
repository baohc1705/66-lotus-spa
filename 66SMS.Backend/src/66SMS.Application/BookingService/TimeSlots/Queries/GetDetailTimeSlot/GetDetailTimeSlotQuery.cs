using _66SMS.Application.DTOs.TimeSlots;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.TimeSlots.Queries.GetDetailTimeSlot
{
    public class GetDetailTimeSlotQuery : IRequest<Result<TimeSlotDto>>
    {
        public int Id { get; set; }

        public GetDetailTimeSlotQuery(int id)
        {
            Id = id;
        }
    }
}
