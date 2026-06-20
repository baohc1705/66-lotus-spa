using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.WorkSchedules.Commands.UpdateWorkSchedule
{
    public class UpdateWorkScheduleCommand : IRequest<Result<object>>
    {
       
        public int? Id { get; set; }
        public int? ShiftPeriodId { get; set; }
        public int? StaffId { get; set; }
        public DateOnly? WorkDate { get; set; }
        [System.Text.Json.Serialization.JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
