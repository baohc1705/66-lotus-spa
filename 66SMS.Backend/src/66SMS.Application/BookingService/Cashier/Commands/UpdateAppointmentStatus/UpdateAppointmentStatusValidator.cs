using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.BookingService.Cashier.Commands.UpdateAppointmentStatus
{
    public sealed class UpdateAppointmentStatusValidator : AbstractValidator<UpdateAppointmentStatusCommand>
    {
        private static readonly int[] AllowedStatuses =
        [
            AppointmentConst.STATUS_PENDING,
            AppointmentConst.STATUS_CONFIRMED,
            AppointmentConst.STATUS_WAITING,
            AppointmentConst.STATUS_IN_SERVICE,
            AppointmentConst.STATUS_COMPLETED,
            AppointmentConst.STATUS_CANCELLED,
            AppointmentConst.STATUS_NO_SHOW,
        ];

        public UpdateAppointmentStatusValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
            RuleFor(x => x.Status).Must(s => AllowedStatuses.Contains(s));
            RuleFor(x => x.Note)
                .MaximumLength(AppointmentConst.NOTE_MAX_LENGTH)
                .When(x => x.Note != null);
        }
    }
}
