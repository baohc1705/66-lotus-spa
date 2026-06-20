using _66SMS.Contracts.Shared;
using MediatR;
using System;

namespace _66SMS.Application.BookingService.TimeSlots.Commands.CreateTimeSlot
{
    public class CreateTimeSlotCommand : IRequest<Result<int>>
    {
        public TimeOnly? StartTime { get; set; }
        public TimeOnly? EndTime { get; set; }
    }
}
