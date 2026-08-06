using FluentValidation;

namespace _66SMS.Application.BookingService.Cashier.Commands.AssignAppointmentStaff
{
    public sealed class AssignAppointmentStaffValidator : AbstractValidator<AssignAppointmentStaffCommand>
    {
        public AssignAppointmentStaffValidator()
        {
            RuleFor(x => x.AppointmentId).GreaterThan(0);
            RuleFor(x => x.StaffId).GreaterThan(0);
        }
    }
}
