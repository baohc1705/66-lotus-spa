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
                guest.RuleFor(g => g.SlotId).NotNull().GreaterThan(0);
                guest.RuleFor(g => g.Services).NotEmpty();
            });
        }
    }
}
