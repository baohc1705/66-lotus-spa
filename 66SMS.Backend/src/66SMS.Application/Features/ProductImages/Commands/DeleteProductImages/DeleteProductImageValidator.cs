using FluentValidation;

namespace _66SMS.Application.Features.ProductImages.Commands.DeleteProductImages
{
    public class DeleteProductImageValidator : AbstractValidator<DeleteProductImageCommand>
    {
        public DeleteProductImageValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
        }
    }
}
