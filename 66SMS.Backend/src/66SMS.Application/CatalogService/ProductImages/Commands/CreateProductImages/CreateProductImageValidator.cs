using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.CatalogService.ProductImages.Commands.CreateProductImages
{
    public class CreateProductImageValidator : AbstractValidator<CreateProductImageCommand>
    {
        public CreateProductImageValidator()
        {
            RuleFor(x => x.Url).NotEmpty().MaximumLength(ProductImageConst.URL_MAX_LENGTH);
        }
    }
}
