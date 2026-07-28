using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.BookingService.ConfigAppointments.Commands.UpdateConfigAppointment
{
    public class UpdateConfigAppointmentValidator : AbstractValidator<UpdateConfigAppointmentCommand>
    {
        public UpdateConfigAppointmentValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);

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
