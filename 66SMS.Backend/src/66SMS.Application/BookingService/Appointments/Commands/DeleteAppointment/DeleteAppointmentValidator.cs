using FluentValidation;

namespace _66SMS.Application.BookingService.Appointments.Commands.DeleteAppointment
{
    public class DeleteAppointmentValidator : AbstractValidator<DeleteAppointmentCommand>
    {
        public DeleteAppointmentValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
        }
    }
}
