using _66SMS.Contracts.Shared;
using MediatR;
using System;
using System.Text.Json.Serialization;

namespace _66SMS.Application.Features.TimeSlots.Commands.UpdateTimeSlot
{
    public class UpdateTimeSlotCommand : IRequest<Result<int>>
    {
        [JsonIgnore]
        public int? Id { get; set; }
        public TimeSpan? StartTime { get; set; }
        public TimeSpan? EndTime { get; set; }
    }
}
