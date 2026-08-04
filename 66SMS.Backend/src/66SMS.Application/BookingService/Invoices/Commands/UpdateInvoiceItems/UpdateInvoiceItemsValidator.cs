using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.BookingService.Invoices.Commands.UpdateInvoiceItems
{
    public class UpdateInvoiceItemsValidator : AbstractValidator<UpdateInvoiceItemsCommand>
    {
        public UpdateInvoiceItemsValidator()
        {
            RuleFor(x => x.Items).NotNull().NotEmpty();
            RuleFor(x => x.DiscountAmount).GreaterThanOrEqualTo(0).When(x => x.DiscountAmount.HasValue);
            RuleFor(x => x.Note).MaximumLength(InvoiceConst.NOTE_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Note));

            RuleForEach(x => x.Items).ChildRules(item =>
            {
                item.RuleFor(x => x.ItemType)
                    .NotNull()
                    .Must(t => t == InvoiceItemConst.TYPE_SERVICE
                        || t == InvoiceItemConst.TYPE_PRODUCT
                        || t == InvoiceItemConst.TYPE_TREATMENT_COURSE)
                    .WithMessage("Loại mặt hàng không hợp lệ.");
                item.RuleFor(x => x.RefId).NotNull().GreaterThan(0);
                item.RuleFor(x => x.Quantity).NotNull().GreaterThan(0);
                item.RuleFor(x => x.DiscountAmount).GreaterThanOrEqualTo(0).When(x => x.DiscountAmount.HasValue);
            });
        }
    }
}
