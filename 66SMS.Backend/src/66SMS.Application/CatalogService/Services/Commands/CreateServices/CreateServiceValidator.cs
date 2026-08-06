using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.CatalogService.Services.Commands.CreateServices
{
    /// <summary>
    /// Validator for <see cref="CreateServiceCommand"/>
    /// </summary>
    public class CreateServiceValidator : AbstractValidator<CreateServiceCommand>
    {
        public CreateServiceValidator()
        {
            RuleFor(x => x.CategoryId).NotNull().GreaterThan(0);
            RuleFor(x => x.Name).NotNull().MaximumLength(ServiceConst.NAME_MAX_LENGTH);
            RuleFor(x => x.Description).MaximumLength(ServiceConst.DESCRIPTION_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Description));
            RuleFor(x => x.DurationMins).NotNull().GreaterThanOrEqualTo(0);
            RuleFor(x => x.CostPrice).NotNull().GreaterThanOrEqualTo(0);
            RuleFor(x => x.SellingPrice).NotNull().GreaterThanOrEqualTo(0);
            RuleFor(x => x.MinSellingPrice).GreaterThanOrEqualTo(0).When(x => x.MinSellingPrice != null);
            RuleFor(x => x.CommissionRate).GreaterThanOrEqualTo(0).When(x => x.CommissionRate != null);
            RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0).When(x => x.SortOrder != null);
            RuleForEach(x => x.ServiceProducts).ChildRules(sp =>
            {
                sp.RuleFor(p => p.ProductId).NotNull().GreaterThan(0);
                sp.RuleFor(p => p.QuantityUsed).GreaterThan(0).When(p => p.QuantityUsed != null);
                sp.RuleFor(p => p.UnitCost).GreaterThanOrEqualTo(0).When(p => p.UnitCost != null);
            }).When(x => x.ServiceProducts != null);
        }
    }
}
