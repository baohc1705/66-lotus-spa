using FluentValidation;

namespace _66SMS.Application.BookingService.Cashier.Commands.AssignAppointmentPosition
{
    public sealed class AssignAppointmentPositionValidator : AbstractValidator<AssignAppointmentPositionCommand>
    {
        public AssignAppointmentPositionValidator()
        {
            RuleFor(x => x.AppointmentId).GreaterThan(0);
            RuleFor(x => x.PositionId).GreaterThan(0);
        }
    }
}
