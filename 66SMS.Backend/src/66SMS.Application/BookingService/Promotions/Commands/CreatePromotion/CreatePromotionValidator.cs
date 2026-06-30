using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.BookingService.Promotions.Commands.CreatePromotion
{
    public class CreatePromotionValidator : AbstractValidator<CreatePromotionCommand>
    {
        public CreatePromotionValidator()
        {
            RuleFor(x => x.Code).NotEmpty().MaximumLength(PromotionConst.CODE_MAX_LENGTH);
            RuleFor(x => x.Name).NotEmpty().MaximumLength(PromotionConst.NAME_MAX_LENGTH);
            RuleFor(x => x.DiscountType).NotNull().InclusiveBetween(1, 3);
            RuleFor(x => x.StartDate).NotNull();
            RuleFor(x => x.EndDate).NotNull()
                .GreaterThan(x => x.StartDate).WithMessage("EndDate phải sau StartDate.");

            When(x => x.DiscountType == PromotionConst.DISCOUNT_TYPE_PERCENT, () =>
            {
                RuleFor(x => x.DiscountValue).NotNull()
                    .InclusiveBetween(0.01m, 100m).WithMessage("DiscountValue phải trong khoảng (0, 100] khi giảm theo %.");
                RuleFor(x => x.MaxDiscountAmount).GreaterThanOrEqualTo(0).When(x => x.MaxDiscountAmount.HasValue);
            });

            When(x => x.DiscountType == PromotionConst.DISCOUNT_TYPE_FIXED, () =>
            {
                RuleFor(x => x.DiscountValue).NotNull()
                    .GreaterThan(0).WithMessage("DiscountValue phải lớn hơn 0 khi giảm số tiền cố định.");
            });

            When(x => x.DiscountType == PromotionConst.DISCOUNT_TYPE_BUYXGETY, () =>
            {
                RuleFor(x => x.BuyQuantity).NotNull().GreaterThan(0);
                RuleFor(x => x.GetQuantity).NotNull().GreaterThan(0);
            });

            RuleFor(x => x.MinOrderValue).GreaterThanOrEqualTo(0).When(x => x.MinOrderValue.HasValue);
            RuleFor(x => x.UsageLimit).GreaterThanOrEqualTo(0).When(x => x.UsageLimit.HasValue);
        }
    }
}
