using FluentValidation;
using _66SMS.Domain.Constants;

namespace _66SMS.Application.BookingService.Cashier.Commands.RescheduleAppointment
{
    public sealed class RescheduleAppointmentValidator : AbstractValidator<RescheduleAppointmentCommand>
    {
        public RescheduleAppointmentValidator()
        {
            RuleFor(x => x.AppointmentId).GreaterThan(0);
            RuleFor(x => x.StartTime)
                .NotEmpty()
                .WithMessage(AppointmentConst.MSG_RESCHEDULE_SLOT_REQUIRED);
            RuleFor(x => x.AppointmentDate)
                .Must(d => d != default)
                .WithMessage(AppointmentConst.MSG_RESCHEDULE_DATE_REQUIRED);
        }
    }
}
