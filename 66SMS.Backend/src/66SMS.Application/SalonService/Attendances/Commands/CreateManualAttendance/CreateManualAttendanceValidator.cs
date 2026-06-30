using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.SalonService.Attendances.Commands.CreateManualAttendance
{
    public class CreateManualAttendanceValidator : AbstractValidator<CreateManualAttendanceCommand>
    {
        public CreateManualAttendanceValidator()
        {
            RuleFor(x => x.StaffId).GreaterThan(0);
            RuleFor(x => x.Status)
                .Must(s => s == AttendanceConst.STATUS_ABSENT
                    || s == AttendanceConst.STATUS_PAID_LEAVE
                    || s == AttendanceConst.STATUS_HOLIDAY
                    || s == AttendanceConst.STATUS_UNPAID_LEAVE)
                .WithMessage(AttendanceConst.MSG_INVALID_STATUS);
            RuleFor(x => x.Note).MaximumLength(AttendanceConst.NOTE_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Note));
        }
    }
}
