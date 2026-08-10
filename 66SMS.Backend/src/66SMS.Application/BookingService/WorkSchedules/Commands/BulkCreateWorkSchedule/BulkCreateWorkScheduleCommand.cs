using _66SMS.Application.BookingService.WorkSchedules.Commands.CreateWorkSchedule;
using _66SMS.Contract.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.BookingService.WorkSchedules.Commands.BulkCreateWorkSchedule
{
    public class BulkCreateWorkScheduleCommand : IRequest<Result<object>>
    {
        public List<CreateWorkScheduleCommand> Schedules { get; set; } = new();
        [JsonIgnore]
        public int? CreatedBy { get; set; }
    }
}
