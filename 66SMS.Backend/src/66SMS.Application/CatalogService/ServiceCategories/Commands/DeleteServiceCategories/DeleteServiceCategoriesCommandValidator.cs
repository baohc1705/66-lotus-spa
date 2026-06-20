using FluentValidation;

namespace _66SMS.Application.CatalogService.ServiceCategories.Commands.DeleteServiceCategories
{
    public class DeleteServiceCategoriesCommandValidator : AbstractValidator<DeleteServiceCategoriesCommand>
    {
        public DeleteServiceCategoriesCommandValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
        }
    }
}
