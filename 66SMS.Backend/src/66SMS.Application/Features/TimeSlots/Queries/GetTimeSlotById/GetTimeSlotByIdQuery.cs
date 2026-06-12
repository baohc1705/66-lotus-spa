using _66SMS.Application.DTOs.TimeSlots;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.TimeSlots.Queries.GetTimeSlotById
{
    public class GetTimeSlotByIdQuery : IRequest<Result<TimeSlotDto>>
    {
        public int Id { get; set; }

        public GetTimeSlotByIdQuery(int id)
        {
            Id = id;
        }
    }
}
