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
            RuleFor(x => x.CommissionRate).GreaterThanOrEqualTo(0).When(x => x.CommissionRate != null);
            RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0).When(x => x.SortOrder != null);
        }
    }
}
