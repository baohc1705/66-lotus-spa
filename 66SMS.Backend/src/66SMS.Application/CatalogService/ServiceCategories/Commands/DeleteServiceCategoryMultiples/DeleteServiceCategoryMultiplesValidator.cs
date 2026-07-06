using FluentValidation;

namespace _66SMS.Application.CatalogService.ServiceCategories.Commands.DeleteServiceCategoryMultiples
{
    public class DeleteServiceCategoryMultiplesValidator : AbstractValidator<DeleteServiceCategoryMultiplesCommand>
    {
        public DeleteServiceCategoryMultiplesValidator()
        {
            RuleFor(x => x.Ids).NotEmpty();
            RuleFor(x => x.Ids).Must(x => x.Distinct().Count() == x.Count);
        }
    }
}
