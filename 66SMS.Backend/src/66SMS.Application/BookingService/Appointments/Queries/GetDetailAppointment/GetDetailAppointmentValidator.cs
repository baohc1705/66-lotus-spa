using FluentValidation;

namespace _66SMS.Application.BookingService.Appointments.Queries.GetDetailAppointment
{
    public class GetDetailAppointmentValidator : AbstractValidator<GetDetailAppointmentQuery>
    {
        public GetDetailAppointmentValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
        }
    }
}
