using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.CatalogService.ServiceCategories.Commands.UpdateServiceCategories
{
    /// <summary>
    /// Validator for <see cref="UpdateServiceCategoriesCommand"/>
    /// </summary>
    public class UpdateServiceCategoriesValidator : AbstractValidator<UpdateServiceCategoriesCommand>
    {
        public UpdateServiceCategoriesValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
            RuleFor(x => x.Name).MaximumLength(ServiceCategoryConst.NAME_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Name));
            RuleFor(x => x.Description).MaximumLength(ServiceCategoryConst.DESCRIPTION_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Description));
            RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0).When(x => x.SortOrder != null);
        }
    }
}
