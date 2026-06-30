using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.SalonService.Attendances.Commands.UpdateAttendance
{
    public class UpdateAttendanceValidator : AbstractValidator<UpdateAttendanceCommand>
    {
        public UpdateAttendanceValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
            RuleFor(x => x.Note).MaximumLength(AttendanceConst.NOTE_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Note));
            RuleFor(x => x.CheckOutAt)
                .GreaterThanOrEqualTo(x => x.CheckInAt!.Value)
                .When(x => x.CheckInAt.HasValue && x.CheckOutAt.HasValue);
        }
    }
}
