using _66SMS.Contracts.Shared;
using MediatR;
using System;

namespace _66SMS.Application.Features.TimeSlots.Commands.CreateTimeSlot
{
    public class CreateTimeSlotCommand : IRequest<Result<int>>
    {
        public TimeSpan? StartTime { get; set; }
        public TimeSpan? EndTime { get; set; }
    }
}
