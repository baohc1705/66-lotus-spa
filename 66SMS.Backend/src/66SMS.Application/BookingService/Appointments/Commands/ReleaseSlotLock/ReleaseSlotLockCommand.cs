using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Appointments.Commands.ReleaseSlotLock
{
    public class ReleaseSlotLockCommand : IRequest<Result<object>>
    {
        public int? LockedByUserId { get; set; }
        public List<int> LockIds { get; set; } = new();
    }
}
