using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Shifts.Commands.CreateShift
{
    public record CreateShiftCommand : IRequest<Result<object>>
    {
        public int? SalonId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public TimeOnly? ShiftStart { get; set; }
        public TimeOnly? ShiftEnd { get; set; }
    }
}
