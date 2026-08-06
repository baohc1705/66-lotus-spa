using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.SalonService.Staffs.Commands.UpdateMyBookingStatus
{
    public sealed class UpdateMyBookingStatusCommand : IRequest<Result<object>>
    {
        public int UserId { get; set; }
        public int Id { get; set; }
        public int Status { get; set; }
        public string? Note { get; set; }
        public int? ServiceId { get; set; }
        public int? AppointmentId { get; set; }
    }
}
