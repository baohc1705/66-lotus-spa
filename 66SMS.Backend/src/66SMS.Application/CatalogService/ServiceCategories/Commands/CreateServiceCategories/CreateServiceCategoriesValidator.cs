using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.CatalogService.ServiceCategories.Commands.CreateServiceCategories
{
    /// <summary>
    /// Validator for <see cref="CreateServiceCategoriesCommand"/>
    /// </summary>
    public class CreateServiceCategoriesValidator : AbstractValidator<CreateServiceCategoriesCommand>
    {
        public CreateServiceCategoriesValidator()
        {
            RuleFor(x => x.Name).NotNull().MaximumLength(ServiceCategoryConst.NAME_MAX_LENGTH);
            RuleFor(x => x.Description).MaximumLength(ServiceCategoryConst.DESCRIPTION_MAX_LENGTH).When(x => x.Description != null);
            RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0).When(x => x.SortOrder != null);
        }
    }
}
