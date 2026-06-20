using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Appointments.Commands.CreateSlotLock
{
    public class CreateSlotLockCommand : IRequest<Result<List<int>>>
    {
        public int? LockedByUserId { get; set; }
        public List<SlotLockDto> Locks { get; set; } = new();
    }

    public class SlotLockDto
    {
        public int? SlotId { get; set; }
        public int? StaffId { get; set; }
        public int? PositionId { get; set; }
        public DateOnly? AppointmentDate { get; set; }
        public int? ServiceId { get; set; }
    }
}
