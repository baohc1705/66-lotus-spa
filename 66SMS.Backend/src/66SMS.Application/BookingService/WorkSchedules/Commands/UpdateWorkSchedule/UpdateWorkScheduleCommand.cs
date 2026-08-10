using System.Text.Json.Serialization;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.WorkSchedules.Commands.UpdateWorkSchedule
{
    public class UpdateWorkScheduleCommand : IRequest<Result<object>>
    {
       
        public int? Id { get; set; }
        public int? ShiftPeriodId { get; set; }
        public int? StaffId { get; set; }
        public int? SalonId { get; set; }
        public DateOnly? WorkDate { get; set; }
        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
