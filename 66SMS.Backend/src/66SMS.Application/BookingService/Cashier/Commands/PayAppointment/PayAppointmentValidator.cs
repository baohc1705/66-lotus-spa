using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.BookingService.Cashier.Commands.PayAppointment
{
    public class PayAppointmentValidator : AbstractValidator<PayAppointmentCommand>
    {
        private static readonly string[] AllowedMethods = ["cash", "transfer", "wallet"];

        public PayAppointmentValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
            RuleFor(x => x.PaymentMethod)
                .NotEmpty()
                .Must(m => !string.IsNullOrWhiteSpace(m)
                    && AllowedMethods.Contains(m.Trim().ToLowerInvariant()))
                .WithMessage(AppointmentConst.MSG_APPOINTMENT_INVALID_PAYMENT_METHOD);
            RuleFor(x => x.Note)
                .MaximumLength(AppointmentPaymentConst.NOTE_MAX_LENGTH)
                .When(x => x.Note != null);
        }
    }
}
