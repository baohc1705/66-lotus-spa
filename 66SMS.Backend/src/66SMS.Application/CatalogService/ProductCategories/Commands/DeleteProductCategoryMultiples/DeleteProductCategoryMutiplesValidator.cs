using FluentValidation;
namespace _66SMS.Application.CatalogService.ProductCategories.Commands.DeleteProductCategoryMultiples
{
    public class DeleteProductCategoryMutilplesValidator : AbstractValidator<DeleteProductCategoryMultiplesCommand>
    {
        public DeleteProductCategoryMutilplesValidator()
        {
            RuleFor(x => x.Ids).NotEmpty();
            RuleFor(x => x.Ids).Must(x => x.Distinct().Count() == x.Count);
        }
    }
}


