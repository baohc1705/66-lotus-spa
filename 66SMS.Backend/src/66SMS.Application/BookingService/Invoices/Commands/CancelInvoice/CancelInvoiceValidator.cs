using FluentValidation;

namespace _66SMS.Application.BookingService.Invoices.Commands.CancelInvoice
{
    public class CancelInvoiceValidator : AbstractValidator<CancelInvoiceCommand>
    {
        public CancelInvoiceValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
        }
    }
}
