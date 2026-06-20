using _66SMS.Contracts.Shared;
using MediatR;
using System;
using System.Text.Json.Serialization;

namespace _66SMS.Application.BookingService.TimeSlots.Commands.UpdateTimeSlot
{
    public class UpdateTimeSlotCommand : IRequest<Result<int>>
    {
        [JsonIgnore]
        public int? Id { get; set; }
        public TimeOnly? StartTime { get; set; }
        public TimeOnly? EndTime { get; set; }
    }
}
