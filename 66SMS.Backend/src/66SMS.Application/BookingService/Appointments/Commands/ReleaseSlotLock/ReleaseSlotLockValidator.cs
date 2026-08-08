using FluentValidation;

namespace _66SMS.Application.BookingService.Appointments.Commands.ReleaseSlotLock
{
    public class ReleaseSlotLockValidator : AbstractValidator<ReleaseSlotLockCommand>
    {
        public ReleaseSlotLockValidator()
        {
            RuleFor(x => x.LockedByUserId).NotNull().GreaterThan(0);
            RuleFor(x => x.LockIds).NotEmpty();
            RuleForEach(x => x.LockIds).GreaterThan(0);
        }
    }
}
