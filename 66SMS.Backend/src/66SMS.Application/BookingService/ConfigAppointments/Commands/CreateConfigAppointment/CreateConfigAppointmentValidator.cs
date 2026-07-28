using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.BookingService.ConfigAppointments.Commands.CreateConfigAppointment
{
    public class CreateConfigAppointmentValidator : AbstractValidator<CreateConfigAppointmentCommand>
    {
        public CreateConfigAppointmentValidator()
        {
            RuleFor(x => x.SalonId)
                .NotNull().WithMessage(ConfigAppointmentConst.MSG_SALON_REQUIRED)
                .GreaterThan(0).WithMessage(ConfigAppointmentConst.MSG_SALON_REQUIRED);

            RuleFor(x => x.DepositPercent)
                .InclusiveBetween(0, 100)
                .When(x => x.DepositPercent.HasValue)
                .WithMessage(ConfigAppointmentConst.MSG_DEPOSIT_PERCENT_INVALID);

            RuleFor(x => x.SlotMinutes)
                .GreaterThan(0)
                .When(x => x.SlotMinutes.HasValue)
                .WithMessage(ConfigAppointmentConst.MSG_SLOT_MINUTES_INVALID);

            RuleFor(x => x)
                .Must(x => !x.StartTime.HasValue || !x.EndTime.HasValue || x.EndTime > x.StartTime)
                .WithMessage(ConfigAppointmentConst.MSG_TIME_RANGE_INVALID);
        }
    }
}
