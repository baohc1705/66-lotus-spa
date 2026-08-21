using _66SMS.Contract.Shared;
using MediatR;
using System.Text.Json.Serialization;
using _66SMS.Contract.Helpers;

namespace _66SMS.Application.SalonService.Attendances.Commands.CreateManualAttendance
{
    public record CreateManualAttendanceCommand : IRequest<Result<int>>
    {
        public int StaffId { get; set; }
        public int? WorkScheduleId { get; set; }
        public DateOnly? WorkDate { get; set; } = DateTimeHelper.VnToday();
        public int Status { get; set; }
        public string? Note { get; set; }

        [JsonIgnore]
        public int? SalonId { get; set; }
    }
}
