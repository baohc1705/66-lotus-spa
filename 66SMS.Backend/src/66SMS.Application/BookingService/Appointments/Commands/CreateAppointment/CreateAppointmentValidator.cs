using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.BookingService.Appointments.Commands.CreateAppointment
{
    public class CreateAppointmentValidator : AbstractValidator<CreateAppointmentCommand>
    {
        public CreateAppointmentValidator()
        {
            RuleFor(x => x.CreatedByUserId).NotNull().GreaterThan(0);
            RuleFor(x => x.Guests).NotEmpty();
            RuleForEach(x => x.Guests).ChildRules(guest =>
            {
                guest.RuleFor(g => g.AppointmentDate).NotNull();
                guest.RuleFor(g => g.SlotId).NotNull().GreaterThan(0);
                guest.RuleFor(g => g.Services).NotEmpty();
                guest.RuleFor(g => g.Note)
                    .MaximumLength(AppointmentConst.NOTE_MAX_LENGTH)
                    .When(g => g.Note != null);
            });
        }
    }
}
