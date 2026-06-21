using FluentValidation;

namespace _66SMS.Application.CatalogService.ServiceCategories.Commands.DeleteServiceCategories
{
    /// <summary>
    /// Validator for <see cref="DeleteServiceCategoriesCommand"/>
    /// </summary>
    public class DeleteServiceCategoriesValidator : AbstractValidator<DeleteServiceCategoriesCommand>
    {
        public DeleteServiceCategoriesValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
        }
    }
}
