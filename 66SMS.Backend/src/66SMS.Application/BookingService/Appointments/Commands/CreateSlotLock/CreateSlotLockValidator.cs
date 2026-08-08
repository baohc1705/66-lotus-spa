using FluentValidation;

namespace _66SMS.Application.BookingService.Appointments.Commands.CreateSlotLock
{
    public class CreateSlotLockValidator : AbstractValidator<CreateSlotLockCommand>
    {
        public CreateSlotLockValidator()
        {
            RuleFor(x => x.Locks).NotEmpty();
            RuleForEach(x => x.Locks).ChildRules(slotLock =>
            {
                slotLock.RuleFor(l => l.SlotId).NotNull().GreaterThan(0);
                slotLock.RuleFor(l => l.ServiceId).NotNull().GreaterThan(0);
                slotLock.RuleFor(l => l.AppointmentDate).NotNull();
            });
        }
    }
}
