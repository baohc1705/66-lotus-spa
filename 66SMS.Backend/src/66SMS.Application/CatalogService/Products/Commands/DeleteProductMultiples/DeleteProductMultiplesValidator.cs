using FluentValidation;

namespace _66SMS.Application.CatalogService.Products.Commands.DeleteProductMultiples
{

    public class DeleteProductMultiplesValidator : AbstractValidator<DeleteProductMultiplesCommand>
    {
        public DeleteProductMultiplesValidator()
        {
            RuleFor(x => x.Ids).NotEmpty();
            RuleFor(x => x.Ids).Must(x => x.Distinct().Count() == x.Count);
        }
    }
}

