using FluentValidation;

namespace _66SMS.Application.BookingService.Appointments.Commands.PayDepositWithWallet
{
    public sealed class PayDepositWithWalletValidator : AbstractValidator<PayDepositWithWalletCommand>
    {
        public PayDepositWithWalletValidator()
        {
            RuleFor(x => x.AppointmentId).NotNull().GreaterThan(0);
            RuleFor(x => x.UserId).NotNull().GreaterThan(0);
        }
    }
}
