using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.WorkSchedules.Commands.DeleteWorkSchedule
{
    public class DeleteWorkScheduleCommand : IRequest<Result<object>>
    {
        public int Id { get; set; }
        [System.Text.Json.Serialization.JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
