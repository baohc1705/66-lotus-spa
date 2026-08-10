using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
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
