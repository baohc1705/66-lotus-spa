using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.Features.ProductImages.Commands.UpdateProductImages
{
    public class UpdateProductImageValidator : AbstractValidator<UpdateProductImageCommand>
    {
        public UpdateProductImageValidator()
        {
            RuleFor(x => x.Url).MaximumLength(ProductImageConst.URL_MAX_LENGTH);
        }
    }
}
