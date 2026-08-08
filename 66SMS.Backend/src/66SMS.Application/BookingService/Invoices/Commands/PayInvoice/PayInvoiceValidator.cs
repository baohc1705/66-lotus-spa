using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.BookingService.Invoices.Commands.PayInvoice
{
    public class PayInvoiceValidator : AbstractValidator<PayInvoiceCommand>
    {
        private static readonly int[] AllowedMethods =
        [
            InvoiceConst.PAYMENT_CASH,
            InvoiceConst.PAYMENT_BANK_TRANSFER,
            InvoiceConst.PAYMENT_WALLET,
            InvoiceConst.PAYMENT_VNPAY,
        ];

        public PayInvoiceValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
            RuleFor(x => x.PaymentMethod).Must(m => AllowedMethods.Contains(m));
            RuleFor(x => x.PaidAmount).GreaterThan(0);
            RuleFor(x => x.Note)
                .MaximumLength(InvoiceConst.NOTE_MAX_LENGTH)
                .When(x => x.Note != null);
        }
    }
}
