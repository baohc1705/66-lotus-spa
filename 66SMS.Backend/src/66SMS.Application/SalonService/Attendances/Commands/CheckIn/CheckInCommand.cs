using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.SalonService.Attendances.Commands.CheckIn
{
    public record CheckInCommand : IRequest<Result<int>>
    {
        public int StaffId { get; set; }
        public int? SalonId { get; set; }
        public int? WorkScheduleId { get; set; }
        public string? Note { get; set; }
    }
}
