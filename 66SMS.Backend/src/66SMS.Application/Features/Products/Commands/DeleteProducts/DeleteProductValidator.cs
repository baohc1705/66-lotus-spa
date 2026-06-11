using FluentValidation;

namespace _66SMS.Application.Features.Products.Commands.DeleteProducts
{
    public class DeleteProductValidator : AbstractValidator<DeleteProductCommand>
    {
        public DeleteProductValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
        }
    }
}
