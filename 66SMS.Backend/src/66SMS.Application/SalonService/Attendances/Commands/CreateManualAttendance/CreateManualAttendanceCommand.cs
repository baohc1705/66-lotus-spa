using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.SalonService.Attendances.Commands.CreateManualAttendance
{
    public record CreateManualAttendanceCommand : IRequest<Result<int>>
    {
        public int StaffId { get; set; }
        public DateOnly WorkDate { get; set; }
        /// <summary>3=Vắng, 4=Nghỉ phép, 5=Nghỉ lễ, 6=Nghỉ không lương</summary>
        public int Status { get; set; }
        public string? Note { get; set; }

        [JsonIgnore]
        public int? SalonId { get; set; }

        [JsonIgnore]
        public int? CreatedBy { get; set; }
    }
}
