using FluentValidation;

namespace _66SMS.Application.BookingService.Appointments.Commands.CreateSlotLock
{
    public class CreateSlotLockValidator : AbstractValidator<CreateSlotLockCommand>
    {
        public CreateSlotLockValidator()
        {
            RuleFor(x => x.LockedByUserId).NotNull().GreaterThan(0);
            RuleFor(x => x.Locks).NotEmpty();
            RuleForEach(x => x.Locks).ChildRules(slotLock =>
            {
                slotLock.RuleFor(l => l)
                    .Must(l => !string.IsNullOrWhiteSpace(l.StartTime))
                    .WithMessage("StartTime là bắt buộc.");
                slotLock.RuleFor(l => l.ServiceId).NotNull().GreaterThan(0);
                slotLock.RuleFor(l => l.AppointmentDate).NotNull();
            });
        }
    }
}
