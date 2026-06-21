using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.CatalogService.Services.Commands.UpdateServices
{
    /// <summary>
    /// Validator for <see cref="UpdateServiceCommand"/>
    /// </summary>
    public class UpdateServiceValidator : AbstractValidator<UpdateServiceCommand>
    {
        public UpdateServiceValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
            RuleFor(x => x.CategoryId).GreaterThan(0).When(x => x.CategoryId != null);
            RuleFor(x => x.Name).MaximumLength(ServiceConst.NAME_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Name));
            RuleFor(x => x.Description).MaximumLength(ServiceConst.DESCRIPTION_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Description));
            RuleFor(x => x.DurationMins).GreaterThanOrEqualTo(0).When(x => x.DurationMins != null);
            RuleFor(x => x.CostPrice).GreaterThanOrEqualTo(0).When(x => x.CostPrice != null);
            RuleFor(x => x.SellingPrice).GreaterThanOrEqualTo(0).When(x => x.SellingPrice != null);
            RuleFor(x => x.CommissionRate).GreaterThanOrEqualTo(0).When(x => x.CommissionRate != null);
            RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0).When(x => x.SortOrder != null);
        }
    }
}
