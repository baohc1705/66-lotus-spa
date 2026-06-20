using _66SMS.Application.BookingService.WorkSchedules.Commands.CreateWorkSchedule;
using _66SMS.Contracts.Shared;
using MediatR;
using System.Collections.Generic;

namespace _66SMS.Application.BookingService.WorkSchedules.Commands.BulkCreateWorkSchedule
{
    public class BulkCreateWorkScheduleCommand : IRequest<Result<object>>
    {
        public List<CreateWorkScheduleCommand> Schedules { get; set; } = new();
        [System.Text.Json.Serialization.JsonIgnore]
        public int? CreatedBy { get; set; }
    }
}
