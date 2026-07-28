using FluentValidation;

namespace _66SMS.Application.BookingService.ConfigAppointments.Commands.DeleteConfigAppointment
{
    public class DeleteConfigAppointmentValidator : AbstractValidator<DeleteConfigAppointmentCommand>
    {
        public DeleteConfigAppointmentValidator()
        {
            RuleFor(x => x.Id).NotEmpty().GreaterThan(0);
        }
    }
}
