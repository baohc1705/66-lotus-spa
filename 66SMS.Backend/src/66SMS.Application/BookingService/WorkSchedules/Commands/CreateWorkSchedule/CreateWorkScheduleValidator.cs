using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.BookingService.WorkSchedules.Commands.CreateWorkSchedule
{
    public class CreateWorkScheduleValidator : AbstractValidator<CreateWorkScheduleCommand>
    {
        public CreateWorkScheduleValidator()
        {
            RuleFor(x => x.ShiftId).NotNull().GreaterThan(0).WithMessage(WorkScheduleConst.MSG_SHIFT_REQUIRED);
            RuleFor(x => x.StaffId).NotNull().GreaterThan(0);
            RuleFor(x => x.WorkDate).NotNull();
        }
    }
}
