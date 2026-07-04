using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.SalonService.Attendances.Commands.CheckOut
{
    public record CheckOutCommand : IRequest<Result<int>>
    {
        public int StaffId { get; set; }
        public int? WorkScheduleId { get; set; }

        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
