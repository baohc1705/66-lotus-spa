using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.BookingService.Promotions.Commands.UpdatePromotion
{
    public class UpdatePromotionValidator : AbstractValidator<UpdatePromotionCommand>
    {
        public UpdatePromotionValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);

            RuleFor(x => x.Code).MaximumLength(PromotionConst.CODE_MAX_LENGTH).When(x => x.Code != null);
            RuleFor(x => x.Name).MaximumLength(PromotionConst.NAME_MAX_LENGTH).When(x => x.Name != null);

            RuleFor(x => x.EndDate)
                .GreaterThan(x => x.StartDate).WithMessage("EndDate phải sau StartDate.")
                .When(x => x.StartDate.HasValue && x.EndDate.HasValue);

            When(x => x.DiscountType == PromotionConst.DISCOUNT_TYPE_PERCENT, () =>
            {
                RuleFor(x => x.DiscountValue)
                    .InclusiveBetween(0.01m, 100m).WithMessage("DiscountValue phải trong khoảng (0, 100] khi giảm theo %.")
                    .When(x => x.DiscountValue.HasValue);
                RuleFor(x => x.MaxDiscountAmount).GreaterThanOrEqualTo(0).When(x => x.MaxDiscountAmount.HasValue);
            });

            When(x => x.DiscountType == PromotionConst.DISCOUNT_TYPE_FIXED, () =>
            {
                RuleFor(x => x.DiscountValue)
                    .GreaterThan(0).WithMessage("DiscountValue phải lớn hơn 0 khi giảm số tiền cố định.")
                    .When(x => x.DiscountValue.HasValue);
            });

            When(x => x.DiscountType == PromotionConst.DISCOUNT_TYPE_BUYXGETY, () =>
            {
                RuleFor(x => x.BuyQuantity).GreaterThan(0).When(x => x.BuyQuantity.HasValue);
                RuleFor(x => x.GetQuantity).GreaterThan(0).When(x => x.GetQuantity.HasValue);
            });

            RuleFor(x => x.MinOrderValue).GreaterThanOrEqualTo(0).When(x => x.MinOrderValue.HasValue);
            RuleFor(x => x.UsageLimit).GreaterThanOrEqualTo(0).When(x => x.UsageLimit.HasValue);
        }
    }
}
