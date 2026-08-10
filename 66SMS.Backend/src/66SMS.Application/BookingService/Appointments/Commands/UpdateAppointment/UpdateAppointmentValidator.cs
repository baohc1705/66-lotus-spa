using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.BookingService.Appointments.Commands.UpdateAppointment
{
    public class UpdateAppointmentValidator : AbstractValidator<UpdateAppointmentCommand>
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

        public UpdateAppointmentValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
            RuleFor(x => x.Status)
                .Must(s => s == null || AllowedStatuses.Contains(s.Value))
                .When(x => x.Status.HasValue);
            RuleFor(x => x.Note)
                .MaximumLength(AppointmentConst.NOTE_MAX_LENGTH)
                .When(x => x.Note != null);
        }
    }
}
