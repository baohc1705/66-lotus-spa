using FluentValidation;

namespace _66SMS.Application.Features.ProductCategories.Commands.DeleteProductCategories
{
    public class DeleteProductCategoryValidator : AbstractValidator<DeleteProductCategoryCommand>
    {
        public DeleteProductCategoryValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
        }
    }
}
