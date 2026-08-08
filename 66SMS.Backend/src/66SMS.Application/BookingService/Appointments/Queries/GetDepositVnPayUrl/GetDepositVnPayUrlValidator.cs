using FluentValidation;

namespace _66SMS.Application.BookingService.Appointments.Queries.GetDepositVnPayUrl
{
    public class GetDepositVnPayUrlValidator : AbstractValidator<GetDepositVnPayUrlQuery>
    {
        public GetDepositVnPayUrlValidator()
        {
            RuleFor(x => x.AppointmentId).NotNull().GreaterThan(0);
            RuleFor(x => x.IpAddress).NotEmpty();
        }
    }
}
