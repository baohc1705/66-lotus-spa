using FluentValidation;

namespace _66SMS.Application.BookingService.Appointments.Commands.PostponeAppointment
{
    public sealed class PostponeAppointmentValidator : AbstractValidator<PostponeAppointmentCommand>
    {
        public PostponeAppointmentValidator()
        {
            RuleFor(x => x.AppointmentId).NotNull().GreaterThan(0);
            RuleFor(x => x.UserId).NotNull().GreaterThan(0);
        }
    }
}
