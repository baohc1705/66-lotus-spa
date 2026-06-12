using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.WorkSchedules.Commands.CreateWorkSchedule
{
    public class CreateWorkScheduleCommand : IRequest<Result<object>>
    {
        public int? ShiftPeriodId { get; set; }
        public int? StaffId { get; set; }
        public DateOnly? WorkDate { get; set; }
        [System.Text.Json.Serialization.JsonIgnore]
        public int? CreatedBy { get; set; }
    }
}
