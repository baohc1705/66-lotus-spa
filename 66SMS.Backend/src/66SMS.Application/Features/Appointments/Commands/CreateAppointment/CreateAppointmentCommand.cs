using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Appointments.Commands.CreateAppointment
{
    public class CreateAppointmentCommand : IRequest<Result<List<int>>>
    {
        public int? CreatedByUserId { get; set; }
        public List<GuestAppointmentDto> Guests { get; set; } = new();
    }

    public class GuestAppointmentDto
    {
        public int? LockId { get; set; }
        public int? StaffId { get; set; }
        public int? SlotId { get; set; }
        public DateOnly? AppointmentDate { get; set; }
        public int? PositionId { get; set; }
        public string? Note { get; set; }
        public List<CreateAppointmentServiceDto>? Services { get; set; }
    }

    public class CreateAppointmentServiceDto
    {
        public int? ServiceId { get; set; }
        public int? Quantity { get; set; }
    }
}
