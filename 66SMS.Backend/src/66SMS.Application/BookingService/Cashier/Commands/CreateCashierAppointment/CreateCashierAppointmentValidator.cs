using _66SMS.Application.BookingService.Appointments.Commands.CreateAppointment;
using FluentValidation;

namespace _66SMS.Application.BookingService.Cashier.Commands.CreateCashierAppointment
{
    public class CreateCashierAppointmentValidator : AbstractValidator<CreateCashierAppointmentCommand>
    {
        public CreateCashierAppointmentValidator()
        {
            RuleFor(x => x.ActorUserId).GreaterThan(0);
            RuleFor(x => x.CustomerId).GreaterThan(0);
            RuleFor(x => x.Guests).NotEmpty();
            RuleForEach(x => x.Guests).ChildRules(guest =>
            {
                guest.RuleFor(g => g.AppointmentDate).NotNull();
                guest.RuleFor(g => g)
                    .Must(g => g.LockId.HasValue || !string.IsNullOrWhiteSpace(g.StartTime))
                    .WithMessage("LockId hoặc StartTime là bắt buộc.");
                guest.RuleFor(g => g.Services).NotEmpty();
            });
        }
    }
}
