using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.BookingService.Invoices.Commands.CreateInvoice
{
    public class CreateInvoiceValidator : AbstractValidator<CreateInvoiceCommand>
    {
        public CreateInvoiceValidator()
        {
            RuleFor(x => x.Items).NotNull().NotEmpty();
            RuleFor(x => x.DiscountAmount).GreaterThanOrEqualTo(0).When(x => x.DiscountAmount.HasValue);
            RuleFor(x => x.TaxAmount).GreaterThanOrEqualTo(0).When(x => x.TaxAmount.HasValue);
            RuleFor(x => x.LoyaltyPointsUsed).GreaterThanOrEqualTo(0).When(x => x.LoyaltyPointsUsed.HasValue);
            RuleFor(x => x.PaidAmount).GreaterThanOrEqualTo(0).When(x => x.PaidAmount.HasValue);
            RuleFor(x => x.CustomerName).MaximumLength(InvoiceConst.CUSTOMER_NAME_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.CustomerName));
            RuleFor(x => x.CustomerPhone).MaximumLength(InvoiceConst.CUSTOMER_PHONE_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.CustomerPhone));
            RuleFor(x => x.Note).MaximumLength(InvoiceConst.NOTE_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Note));

            RuleForEach(x => x.Items).ChildRules(item =>
            {
                item.RuleFor(x => x.ItemType)
                    .NotNull()
                    .Must(t => t == InvoiceItemConst.TYPE_SERVICE || t == InvoiceItemConst.TYPE_PRODUCT || t == InvoiceItemConst.TYPE_TREATMENT_COURSE)
                    .WithMessage("Loại mặt hàng không hợp lệ.");
                item.RuleFor(x => x.RefId).NotNull().GreaterThan(0);
                item.RuleFor(x => x.Quantity).NotNull().GreaterThan(0);
                item.RuleFor(x => x.DiscountAmount).GreaterThanOrEqualTo(0).When(x => x.DiscountAmount.HasValue);
            });
        }
    }
}
